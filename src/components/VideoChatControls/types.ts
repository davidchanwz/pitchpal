export interface VideoChatControlsProps {
  muted?: boolean
  setMuted?: (muted: boolean) => void
  onMuteClick?: () => void
  onExitClick?: () => void
}
