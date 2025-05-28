import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Conversation from "@/components/Conversation";
import VideoChatControls from "@/components/VideoChatControls";
import StartConversationButton from "@/components/StartConversationButton";
import ThinkingState from "@/components/ThinkingState";
import { Button } from 'primereact/button';

interface ScenarioContentProps {
  title: string;
  description: string;
  startMessage: string;
  prompt: string;
  avatar: string;
  backgroundImageUrl: string;
  voice: string;
}

const generateShortId = () => {
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${randomNum}`;
};

export default function ScenarioContent({
  title,
  description,
  startMessage,
  prompt,
  avatar,
  backgroundImageUrl,
  voice,
}: ScenarioContentProps) {
  const router = useRouter();
  const [conversationId] = useState(generateShortId());
  const [hasStarted, setHasStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [thinkingState, setThinkingState] = useState<boolean>(false);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  const handleConversationEnd = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    setHasStarted(false);
  };

  const handleBack = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    router.push('/');
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
      {!hasStarted ? (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-2">
          <StartConversationButton onClick={() => setHasStarted(true)} />
        </div>
      ) : (
        <div className=" inset-0 z-5 flex flex-col">
          <Conversation
            conversationId={conversationId}
            startMessage={startMessage}
            prompt={prompt}
            avatar={avatar}
            backgroundImageUrl={backgroundImageUrl}
            voice={voice}
            muted={muted}
            setThinkingState={setThinkingState}
            onConversationEnd={handleConversationEnd}
            audioTrack={audioTrackRef.current}
          >
            {thinkingState && <ThinkingState />}
            <VideoChatControls
              muted={muted}
              setMuted={setMuted}
              onMuteClick={() => setMuted((curr) => !curr)}
              onExitClick={handleConversationEnd}
            />
          </Conversation>
        </div>
      )}
    </div>
  );
}