import { Button } from 'primereact/button';
import { MicIcon, MicOffIcon, XIcon } from 'lucide-react';
import { VideoChatControlsProps } from './types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ICON_SIZE = 32

function VideoChatControls(props: VideoChatControlsProps) {
  const { muted, setMuted, onMuteClick, onExitClick } = props
  const router = useRouter();

  // Effect for keypress event
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.code === "Space") {
        event.preventDefault();
        if (setMuted) {
          setMuted(!muted);
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [muted]);

  return (
    <div className="absolute bottom-0 p-4 w-full flex align-items-center justify-content-center gap-4">
      <Button
        rounded
        raised
        onClick={onMuteClick}
        className="p-3 h-4rem w-4rem"
        severity={muted ? 'danger' : 'secondary'}
        icon={muted ? <MicOffIcon width={ICON_SIZE} height={ICON_SIZE} /> : <MicIcon width={ICON_SIZE} height={ICON_SIZE} />}
      />
      <Button
        rounded
        raised
        onClick={onExitClick}
        className="p-3 h-4rem w-4rem"
        severity="danger"
        icon={<XIcon width={ICON_SIZE} height={ICON_SIZE} />}
      />
    </div>
  )
}

export default VideoChatControls
