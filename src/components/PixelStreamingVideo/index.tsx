// Code reference: https://github.com/tplusplusdevhub/temus-dialogforge-avatar/blob/8c0a224f4135fb614ad2d0feeb0fe0888cc3bfa9/ue/PixelStreaming/WebServers/Frontend/implementations/react/src/components/PixelStreamingWrapper.tsx
import { useEffect, useRef, useState } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.3";
import { PixelStreamingVideoProps } from "./types";

function PixelStreamingVideo(props: PixelStreamingVideoProps) {
  const { avatarId } = props;
  const [scale, setScale] = useState(1);
  const videoParent = useRef<HTMLDivElement>(null);
  const [pixelStreaming, setPixelStreaming] = useState<PixelStreaming>();
  const [isAutoplayRejected, setIsAutoplayRejected] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Calculate scale based on the window width
      const width = window.innerWidth;
      const height = window.innerHeight;

      const currentAspectRatio = width / height;
      const videoAspectRatio = 1920 / 1080;

      // Adjust scale based on aspect ratio or other criteria
      const lowScale = videoAspectRatio / currentAspectRatio;
      const highScale = currentAspectRatio / videoAspectRatio;
      setScale(Math.max(lowScale, highScale));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); 
  }, [])

  useEffect(() => {
    if (!isAutoplayRejected || !pixelStreaming) {
      return
    }

    pixelStreaming.play();
    setIsAutoplayRejected(false);
  }, [isAutoplayRejected, pixelStreaming])

  useEffect(() => {
    if (!videoParent.current || !avatarId) {
      return
    }

    const config = new Config({
      initialSettings: {
        ss: `${process.env.NEXT_PUBLIC_WSS_SERVER_URL}/avatar/${avatarId}`,
        StartVideoMuted: true,
        AutoPlayVideo: true,
        WebRTCFPS: 24,
        KeyboardInput: false,
        TouchInput: false,
        GamepadInput: false,
        AutoConnect: true,
        SuppressBrowserKeys: true,
      },
    })

    const streaming = new PixelStreaming(config, {
      videoElementParent: videoParent.current,
    })

    streaming.addEventListener('playStreamRejected', () => {
      setIsAutoplayRejected(true);
    })

    setPixelStreaming(streaming);

    return () => {
      try {
        streaming.disconnect()
      } catch (e) {
        console.error('failed to disconnect pixel streaming', e)
      }
    }
  }, [videoParent, avatarId])

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      <div className="w-full h-full overflow-hidden" ref={videoParent} />
      <div className="absolute overflow-hidden top-0 left-0 right-0 bottom-0" />
    </div>
  )
}

export default PixelStreamingVideo
