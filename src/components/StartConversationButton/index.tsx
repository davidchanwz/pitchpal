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
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <Button
        rounded
        onClick={onClick}
        label="Start Scenario"
        className="mb-2 w-full font-semibold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
        style={{ borderRadius: '9999px', minHeight: 48, minWidth: 0 }}
        disabled={!isChatAvailable}
        size="large"
      />
      <div className="flex items-center gap-2 w-full justify-center">
        <div className={clsx("border-circle", isCheckingStatus ? 'surface-300' : isChatAvailable ? 'bg-green-500' : 'bg-red-500')} style={{ width: 10, height: 10 }} />
        <span className="text-sm font-medium text-gray-700">
          {isCheckingStatus ? 'Checking chat status...' : isChatAvailable ? 'Chat available' : 'Chat not available'}
        </span>
      </div>
    </div>
  )
}

export default StartConversationButton
