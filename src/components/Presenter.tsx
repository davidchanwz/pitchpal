import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OneWayAudio from "@/components/OneWayConversation";
import VideoChatControls from "@/components/VideoChatControls";
import StartConversationButton from "@/components/StartConversationButton";
import ThinkingState from "@/components/ThinkingState";
import { Button } from "primereact/button";
import { VoiceCallAvailableResponse } from "@/components/StartConversationButton/types";
import OneWayConversation from "@/components/OneWayConversation";
import Conversation from "./Conversation";

interface PresenterProps {
  startMessage: string;
  prompt: string;
  avatar: string;
  backgroundImageUrl: string;
  voice: string;
  script: string;
  clickNextSlide: () => void;
}

const generateShortId = () => {
  const randomNum = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${randomNum}`;
};

export default function Presenter({
  startMessage,
  prompt,
  avatar,
  backgroundImageUrl,
  voice,
  script,
  clickNextSlide,
}: PresenterProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(generateShortId());
  const [hasStarted, setHasStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [thinkingState, setThinkingState] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isChatAvailable, setIsChatAvailable] = useState(true);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const scriptParts = script.split("<CLICK>");
//   const checkAvailability = async () => {
//     try {
//       const response = await axios.get<VoiceCallAvailableResponse>(
//         `${process.env.NEXT_PUBLIC_HTTP_SERVER_URL}/api/conversation/available`,
//         {
//           headers: { "xi-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
//         }
//       );
//       setIsChatAvailable(response.data.voice_call_available);
//     } catch (error) {
//       console.error("Error checking chat availability:", error);
//     } finally {
//       setIsCheckingStatus(false);
//     }
//   };

//   useEffect(() => {
//     // Check availability immediately
//     checkAvailability();

//     // Then set up interval for subsequent checks
//     const interval = setInterval(checkAvailability, 2000);

//     return () => clearInterval(interval);
//   }, []);

  const handleConversationEnd = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    setHasStarted(false);

    // If we've processed all parts, we're done
    clickNextSlide();
  };

  const handleBack = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    router.push("/");
  };

  const handleAvatarFinishedSpeaking = () => {
    console.log(
      `Avatar finished speaking for script part ${currentScriptIndex + 1}`
    );

    // Immediately kill the current connection
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }

    // Move to next script part if available
    if (currentScriptIndex < scriptParts.length - 1) {
      // Generate new conversation ID for clean separation
      setConversationId(generateShortId());
      setCurrentScriptIndex((prev) => prev + 1);
    } else {
      // All parts are done, end the conversation
      handleConversationEnd();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <Button
        icon="pi pi-arrow-left"
        onClick={handleBack}
        className="absolute top-2 left-2 z-10"
        rounded
        text
        size="large"
        severity="secondary"
        aria-label="Back"
      />
      {isChatAvailable && currentScriptIndex < scriptParts.length && (
        <div className="w-1/2 inset-0 z-5 flex flex-col">
          <OneWayConversation
            conversationId={conversationId}
            startMessage={scriptParts[currentScriptIndex]}
            prompt={prompt}
            avatar={avatar}
            backgroundImageUrl={backgroundImageUrl}
            voice={voice}
            muted={muted}
            setThinkingState={setThinkingState}
            onConversationEnd={handleConversationEnd}
            audioTrack={audioTrackRef.current}
            onAvatarFinishedSpeaking={handleAvatarFinishedSpeaking}
          />
        </div>
      )}

      {currentScriptIndex >= scriptParts.length && (
        <div className="w-1/2 inset-0 z-5 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-2">Presentation Complete!</p>
            <p className="text-sm text-gray-600">
              All {scriptParts.length} parts have been presented.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
