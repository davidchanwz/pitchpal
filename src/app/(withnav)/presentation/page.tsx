"use client";

import { useSearchParams } from "next/navigation";
import { scenarios } from "@/config/scenarios";
import Presentation from "@/components/Presentation";
import ScenarioContent from "@/components/ScenarioContent";
import { useState, useEffect } from "react";
import { UploadService } from "@/services/UploadService";
import Presenter from "@/components/Presenter";

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const slideId = searchParams.get("slideId") || "";
  const avatarId = searchParams.get("avatarId") || "default-avatar";
  const [slideData, setSlideData] = useState<any>(null);
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the scenario that matches the avatar id (either by exact ID match or by avatar field)
  const scenario =
    scenarios.find((s) => s.id === avatarId || s.avatar === avatarId) ||
    scenarios.find((s) => s.id.includes("presentation")) ||
    scenarios[0];

  // Handler to navigate to next slide in the presentation
  const nextSlideHandler = () => {
    try {
      // Try to find the presentation viewer element
      const presentationElement = 
        document.querySelector('[class*="doc-viewer"]') ||
        document.querySelector('[class*="react-pdf"]') ||
        document.querySelector(".presentation-container") ||
        document.querySelector('iframe') ||
        document.querySelector('[data-testid="doc-viewer"]');

      if (presentationElement) {
        // Dispatch a click event to advance the slide
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1
        });
        presentationElement.dispatchEvent(clickEvent);
      } else {
        console.warn("Could not find presentation element to click");
      }
    } catch (err) {
      console.error("Error navigating to next slide:", err);
    }
  };

  useEffect(() => {
    const fetchScript = async () => {
      if (!slideId) {
        setError("No slide ID provided");
        setLoading(false);
        return;
      }
      try {
        const result = await UploadService.getScriptBySlideId(slideId);
        if (result.success) {
          setScript(result.script || "");
        } else {
          setError(result.error || "Failed to fetch script");
        }
      } catch (err) {
        setError("An error occurred while fetching the script");
      } finally {
        setLoading(false);
      }
    };

    const fetchSlide = async () => {
      if (!slideId) {
        setError("No slide ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await UploadService.getSlideById(slideId);
        if (result.success) {
          setSlideData(result.data);
        } else {
          setError(result.error || "Failed to fetch slide");
        }
      } catch (err) {
        setError("An error occurred while fetching the slide");
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
    fetchSlide();
  }, [slideId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading presentation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!slideData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">No slide data found</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-stretch justify-center h-screen w-full bg-gray-50">
      {/* Presentation Document */}
      {slideData.slideUrl && (
        <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
          <Presentation presentationLink={slideData.slideUrl} />
        </div>
      )}
      {/* ScenarioContent Overlay */}
      <div className="absolute bottom-8 right-8 z-20 w-1/2 ">
        <div className="w-full flex flex-col items-center justify-center">
          <Presenter
            startMessage={scenario.startMessage}
            prompt={scenario.prompt}
            avatar={scenario.avatar}
            backgroundImageUrl={scenario.backgroundImageUrl}
            voice={scenario.voice}
            script={script!}
            clickNextSlide={nextSlideHandler}
          />
        </div>
      </div>
    </div>
  );
}
