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

    console.log('PixelStreaming initialized', streaming);
    setTimeout(() => {
      if (videoParent.current) {
        console.log('videoParent children after PixelStreaming init:', videoParent.current.children);
      }
    }, 1000);

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

  useEffect(() => {
    // For now, always use scale 1 to ensure video is full size
    setScale(1);
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-50 bg-black flex items-center justify-center"
      style={{}}
    >
      <style>{`
        .pixel-streaming-video-parent video {
          width: 100vw !important;
          height: 100vh !important;
          object-fit: cover;
          display: block;
        }
      `}</style>
      <div
        className="w-full h-full overflow-hidden pixel-streaming-video-parent"
        ref={videoParent}
      />
    </div>
  )
}

export default PixelStreamingVideo
