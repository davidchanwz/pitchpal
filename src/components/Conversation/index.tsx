'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProps, AvatarWebsocketMessage } from "./types";
import PixelStreamingVideo from "../PixelStreamingVideo";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';

const rtcConfig = process.env.NEXT_PUBLIC_USE_TURN_SERVER === 'true' ? {
  iceServers: [
    { urls: `stun:${process.env.NEXT_PUBLIC_STUN_SERVER}` },
    {
      urls: `turn:${process.env.NEXT_PUBLIC_TURN_SERVER}`,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    },
  ]
} : undefined;

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
  } = props;
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [inputAudioTrack, setInputAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [outputAudioTrack, setOutputAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [avatarId, setAvatarId] = useState('');
  const [avatarName, setAvatarName] = useState('');

  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket<AvatarWebsocketMessage | null>(
    `${process.env.NEXT_PUBLIC_WSS_SERVER_URL}/api/conversation/webrtc/${conversationId}`
  )

  const cleanupMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setAudioTrack(null);
    setInputAudioTrack(null);
    setOutputAudioTrack(null);
  }, []);

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
        if (peerRef.current && peerRef.current.signalingState !== 'closed') {
          peerRef.current.addTrack(track, stream);
        }
      });

      const [mainAudioTrack] = stream.getAudioTracks();
      setAudioTrack(mainAudioTrack);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));

      return peer;
    } catch (error) {
      console.error('Error setting up peer connection:', error);
      cleanupMedia();
      return null;
    }
  }, [cleanupMedia]);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    const { type } = lastJsonMessage;

    if (type === 'status' && lastJsonMessage.avatar_uuid) {
      setAvatarId(lastJsonMessage.avatar_uuid);
      onVideoReady?.();
    }
    
    if (type === 'answer' && peerRef.current) {
      peerRef.current.setRemoteDescription(new RTCSessionDescription(lastJsonMessage.answer))
        .then(() => {
          // Get the output audio track
          peerRef.current?.getReceivers().forEach(receiver => {
            if (receiver.track.kind === 'audio') {
              setOutputAudioTrack(receiver.track);
            }
          });
        });
    }

    if (type === 'end_call') {
      cleanupMedia();
      onConversationEnd?.();
    }

    if (type === 'name') {
      setAvatarName(lastJsonMessage.name);
    }

    if (type === 'thinkingState') {
      setThinkingState?.(lastJsonMessage.thinking);
    }

    // Display toast when unauthorized error occurs
    if (type === 'error' && lastJsonMessage.error === 'unauthorized') {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Unauthorized',
        detail: 'You are not authorized to access this conversation, please make sure the API Key is correctly passed to the conversation websocket.',
        life: 5000
      });
    }

    onWebsocketMessage?.(lastJsonMessage);
  }, [lastJsonMessage, onConversationEnd, onVideoReady, onWebsocketMessage, setThinkingState, cleanupMedia]);

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
        avatar,
        backgroundImageUrl,
        voice,
        ...conversationSetupParams,
      }
    });

    createPeerConnection().then(peer => {
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
  }, [readyState, sendJsonMessage, conversationSetupParams, prompt, createPeerConnection, cleanupMedia]);

  useEffect(() => {
    if (!audioTrack) {
      return;
    }
    audioTrack.enabled = !muted;
  }, [muted]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <Toast ref={toastRef} position="top-center" />
      <PixelStreamingVideo avatarId={avatarId} />
      {avatarName && (
        <div className="absolute top-0 left-0 py-2 px-3 mt-3 ml-3 border-round-xl" style={{ backgroundColor: 'rgba(211, 211, 211, 0.8)' }}>
          <p className="m-0 text-2xl text-black">{avatarName}</p>
        </div>
      )}
      <audio ref={remoteAudioRef} autoPlay />
      {children}
    </div>
  )
}

export default Conversation
