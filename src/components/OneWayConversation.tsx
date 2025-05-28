"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConversationProps,
  AvatarWebsocketMessage,
} from "./Conversation/types";
import PixelStreamingVideo from "./PixelStreamingVideo";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";

const rtcConfig =
  process.env.NEXT_PUBLIC_USE_TURN_SERVER === "true"
    ? {
        iceServers: [
          { urls: `stun:${process.env.NEXT_PUBLIC_STUN_SERVER}` },
          {
            urls: `turn:${process.env.NEXT_PUBLIC_TURN_SERVER}`,
            username: process.env.NEXT_PUBLIC_TURN_USERNAME,
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
          },
        ],
      }
    : undefined;

function Conversation(props: ConversationProps) {
  const router = useRouter();
  const toastRef = useRef<Toast>(null);
  const {
    muted = false,
    conversationId,
    startMessage,
    prompt,
    avatar,
    backgroundImageUrl,
    voice,
    conversationSetupParams,
    children,
    onVideoReady,
    setThinkingState,
    onConversationEnd,
    onWebsocketMessage,
    onAvatarFinishedSpeaking,
  } = props;
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [inputAudioTrack, setInputAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [outputAudioTrack, setOutputAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [avatarId, setAvatarId] = useState("");
  const [avatarName, setAvatarName] = useState("");

  // Audio silence detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const hasDetectedSpeechRef = useRef<boolean>(false);

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<AvatarWebsocketMessage | null>(
      `${process.env.NEXT_PUBLIC_WSS_SERVER_URL}/api/conversation/webrtc/${conversationId}`
    );

  // Audio silence detection functions
  const setupAudioAnalysis = useCallback((track: MediaStreamTrack) => {
    try {
      // Clean up existing audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(
        new MediaStream([track])
      );

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start monitoring audio levels
      startAudioMonitoring();
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  }, []);

  const startAudioMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const SILENCE_THRESHOLD = 30; // Adjust this value as needed (0-255)
    const SILENCE_DURATION = 1000; // 2 seconds of silence before triggering
    const CHECK_INTERVAL = 100; // Check every 100ms

    const checkAudioLevel = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      const currentTime = Date.now();

      if (average > SILENCE_THRESHOLD) {
        // Audio detected - update last speech time and mark that we've detected speech
        lastSpeechTimeRef.current = currentTime;
        hasDetectedSpeechRef.current = true;

        // Clear any existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
      } else if (hasDetectedSpeechRef.current) {
        // Silence detected, but only after we've heard speech
        const timeSinceLastSpeech = currentTime - lastSpeechTimeRef.current;

        if (
          timeSinceLastSpeech >= SILENCE_DURATION &&
          !silenceTimeoutRef.current
        ) {
          // Set a timeout to trigger the callback
          silenceTimeoutRef.current = setTimeout(() => {
            console.log("Avatar finished speaking - silence detected");
            cleanupAudioAnalysis();
            onAvatarFinishedSpeaking?.();
          }, 500); // Small delay to avoid false positives
        }
      }
    };

    // Start the monitoring interval
    audioCheckIntervalRef.current = setInterval(
      checkAudioLevel,
      CHECK_INTERVAL
    );
  }, [onAvatarFinishedSpeaking]);

  const cleanupAudioAnalysis = useCallback(() => {
    // Clear timeouts and intervals
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (audioCheckIntervalRef.current) {
      clearInterval(audioCheckIntervalRef.current);
      audioCheckIntervalRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    hasDetectedSpeechRef.current = false;
  }, []);

  const cleanupMedia = useCallback(() => {
    // Clean up audio analysis first
    cleanupAudioAnalysis();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setAudioTrack(null);
    setInputAudioTrack(null);
    setOutputAudioTrack(null);
  }, [cleanupAudioAnalysis]);

  const createPeerConnection = useCallback(async () => {
    // Clean up any existing connection first
    cleanupMedia();

    const peer = new RTCPeerConnection(rtcConfig);
    peerRef.current = peer;

    peer.ontrack = (event) => {
      event.streams.forEach((stream) => {
        if (remoteAudioRef.current && stream.getAudioTracks().length) {
          remoteAudioRef.current.srcObject = stream;
        }
      });
    };

    try {
      const stream = await navigator.mediaDevices?.getUserMedia({
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;
      stream.getTracks().forEach((track) => {
        if (peerRef.current && peerRef.current.signalingState !== "closed") {
          peerRef.current.addTrack(track, stream);
        }
      });

      const [mainAudioTrack] = stream.getAudioTracks();
      setAudioTrack(mainAudioTrack);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));

      return peer;
    } catch (error) {
      console.error("Error setting up peer connection:", error);
      cleanupMedia();
      return null;
    }
  }, [cleanupMedia]);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    const { type } = lastJsonMessage;

    if (type === "status" && lastJsonMessage.avatar_uuid) {
      setAvatarId(lastJsonMessage.avatar_uuid);
      onVideoReady?.();
    }

    if (type === "answer" && peerRef.current) {
      try {
        peerRef.current
          .setRemoteDescription(
            new RTCSessionDescription(lastJsonMessage.answer)
          )
          .then(() => {
            // Get the output audio track
            peerRef.current?.getReceivers().forEach((receiver) => {
              if (receiver.track.kind === "audio") {
                setOutputAudioTrack(receiver.track);
              }
            });
          })
          .catch((error) => {
            console.error("Error setting remote description:", error);
          });
      } catch (error) {
        console.error("Error creating or setting remote description:", error);
      }
    }

    if (type === "thinkingState") {
      setThinkingState?.(lastJsonMessage.thinking);
    }

    // Display error toast
    if (type === "error") {
      toastRef.current?.show({
        severity: "error",
        summary: lastJsonMessage.message,
        life: 5000,
      });
    }

    onWebsocketMessage?.(lastJsonMessage);
  }, [
    lastJsonMessage,
    onConversationEnd,
    onVideoReady,
    onWebsocketMessage,
    setThinkingState,
    cleanupMedia,
  ]);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) {
      return;
    }

    sendJsonMessage({
      type: "setup",
      param: {
        apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
        startMessage,
        prompt,
        temperature: 0.0,
        topP: 0.9,
        avatar,
        backgroundImageUrl,
        voice,
        ...conversationSetupParams,
      },
    });

    createPeerConnection().then((peer) => {
      if (peer) {
        sendJsonMessage({
          type: "offer",
          offer: peer.localDescription,
        });
      }
    });

    return () => {
      cleanupMedia();
    };
  }, [
    readyState,
    sendJsonMessage,
    conversationSetupParams,
    prompt,
    createPeerConnection,
    cleanupMedia,
  ]);

  useEffect(() => {
    if (!audioTrack) {
      return;
    }
    audioTrack.enabled = !muted;
  }, [muted]);

  // Audio silence detection effect for output audio (avatar speech)
  useEffect(() => {
    if (!outputAudioTrack) {
      return;
    }

    console.log("Setting up audio analysis for avatar speech detection");
    setupAudioAnalysis(outputAudioTrack);

    return () => {
      cleanupAudioAnalysis();
    };
  }, [outputAudioTrack, setupAudioAnalysis, cleanupAudioAnalysis]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <Toast ref={toastRef} position="top-center" />
      <PixelStreamingVideo avatarId={avatarId} />
      {avatarName && (
        <div
          className="absolute top-0 left-0 py-2 px-3 mt-3 ml-3 border-round-xl"
          style={{ backgroundColor: "rgba(211, 211, 211, 0.8)" }}
        >
          <p className="m-0 text-2xl text-black">{avatarName}</p>
        </div>
      )}
      <audio ref={remoteAudioRef} autoPlay />
      {children}
    </div>
  );
}

export default Conversation;
