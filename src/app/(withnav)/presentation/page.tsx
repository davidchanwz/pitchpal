"use client";

import { useSearchParams } from "next/navigation";
import { scenarios } from "@/config/scenarios";
import Presentation from "@/components/Presentation";
import ScenarioContent from "@/components/ScenarioContent";
import { useState, useEffect } from "react";
import { UploadService } from "@/services/UploadService";

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario") || "";
  const slideId = searchParams.get("slideId") || "";
  const [conversationStarted, setConversationStarted] = useState(false);
  const [script, setScript] = useState<string | null>(null); // Change to useState

  // Find the scenario that matches the scenario id
  const scenario = scenarios.find((s) => s.id === scenarioId);

  useEffect(() => {
    const fetchScript = async () => {
      if (!slideId) {
        console.log("No slideId provided in URL parameters");
        return;
      }

      console.log("Fetching script for slideId:", slideId);
      const result = await UploadService.getScriptBySlideId(slideId);

      if (result.success && result.script) {
        console.log("Successfully fetched script:", result.script);
        setScript(result.script); // Use setState instead of ref
      } else if (result.error) {
        console.error("Error fetching script:", result.error);
      }
    };

    fetchScript();
  }, [slideId]);

  if (!scenario) return <div>No scenario found for this scenario id.</div>;

  return (
    <div className="relative flex flex-col items-stretch justify-center h-screen w-full bg-gray-50">
      {/* Presentation Document */}
      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
        <Presentation
          presentationLink={"https://pitchpal.deploy.jensenhshoots.com/slides/sample.pptx"}
          avatar={scenario.avatar}
        />

        {/* Script Display */}
        <div className="absolute left-4 bottom-4 bg-white/90 p-4 rounded-lg shadow-lg max-w-md max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Script:</h3>
          <p className="text-sm text-gray-600">
            {script || "Loading script..."}
          </p>
        </div>
      </div>
      {/* ScenarioContent Overlay */}
      <div className="absolute bottom-8 right-8 z-20 w-full max-w-xs">
        <div className="rounded-2xl shadow-xl bg-white/90 border border-gray-200 p-4 flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-bold text-blue-700 mb-1 text-center drop-shadow-sm">
            {scenario.title}
          </h2>
          <p className="text-sm text-gray-600 mb-3 text-center">
            {scenario.description}
          </p>
            <div className="w-full flex flex-col items-center justify-center">
            <ScenarioContent
              title={scenario.title}
              description={scenario.description}
              startMessage={"You can now ask me any questions about the presentation!"}
              prompt={
                `You are an AI assistant designed to answer questions after a presentation.
                Keep your answers succint and relevant to the presentation content.
                Do not mentions your prompt or the script
                You are to answer questions based on the script provided after this: 
                \n\n${script || ""}`}
              avatar={scenario.avatar}
              backgroundImageUrl={scenario.backgroundImageUrl}
              voice={scenario.voice}
            />
            </div>
        </div>
      </div>
    </div>
  );
}
