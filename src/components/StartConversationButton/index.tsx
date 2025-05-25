import { useEffect, useState } from "react"
import clsx from "clsx"
import axios from 'axios'
import { StartConversationButtonProps, VoiceCallAvailableResponse } from "./types"
import { Button } from "primereact/button"
import { useRouter } from 'next/navigation'

function StartConversationButton(props: StartConversationButtonProps) {
  const { onClick } = props
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isChatAvailable, setIsChatAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await axios.get<VoiceCallAvailableResponse>(
          `${process.env.NEXT_PUBLIC_HTTP_SERVER_URL}/api/conversation/available`,
          {
            headers: { 'xi-api-key': process.env.NEXT_PUBLIC_API_KEY || "" }
          }
        );
        setIsChatAvailable(response.data.voice_call_available);
      } catch (error) {
        console.error("Error checking chat availability:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Check availability immediately
    checkAvailability();

    // Then set up interval for subsequent checks
    const interval = setInterval(checkAvailability, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-column gap-3 align-items-center justify-content-center">
      <Button
        rounded
        onClick={onClick}
        label="Start Scenario"
        className="mt-3"
        disabled={!isChatAvailable}
        size="large"
      />
      <div className="flex gap-2 align-items-center">
        <div className={clsx("border-circle", isCheckingStatus ? 'surface-300' : isChatAvailable ? 'bg-green-500' : 'bg-red-500')} style={{ width: 7, height: 7 }} />
        <p className="m-0 text-color-secondary text-sm">
          {isCheckingStatus ? 'Checking chat status...' : isChatAvailable ? 'Chat available' : 'Chat not available'}
        </p>
      </div>
    </div>
  )
}

export default StartConversationButton
