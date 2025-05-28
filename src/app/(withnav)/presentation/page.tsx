"use client";

import { useSearchParams } from "next/navigation";
import { scenarios } from "@/config/scenarios";
import Presentation from "@/components/Presentation";
import ScenarioContent from "@/components/ScenarioContent";
import { useState } from "react";

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario") || "";
  // Find the scenario that matches the scenario id
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) return <div>No scenario found for this scenario id.</div>;

  const [conversationStarted, setConversationStarted] = useState(false);

  return (
    <div className="relative flex flex-col items-stretch justify-center h-screen w-full bg-gray-50">
      {/* Presentation Document */}
      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
        <Presentation presentationLink={"https://pitchpal.deploy.jensenhshoots.com/slides/sample.pptx"} avatar={scenario.avatar} />
      </div>
      {/* ScenarioContent Overlay */}
      <div className="absolute bottom-8 right-8 z-20 w-full max-w-xs">
        <div className="rounded-2xl shadow-xl bg-white/90 border border-gray-200 p-4 flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-bold text-blue-700 mb-1 text-center drop-shadow-sm">{scenario.title}</h2>
          <p className="text-sm text-gray-600 mb-3 text-center">{scenario.description}</p>
          <div className="w-full flex flex-col items-center justify-center">
            <ScenarioContent
              title={scenario.title}
              description={scenario.description}
              startMessage={scenario.startMessage}
              prompt={scenario.prompt}
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
