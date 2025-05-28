'use client';

import { Suspense } from "react";
import ScenarioContent from "@/components/ScenarioContent";
import { scenarios } from "@/config/scenarios";

function TemusAvatarCustomerPage() {
  const scenario = scenarios.find(s => s.id === 'temus-avatar-customer')!;
  
  return (
    <div className="relative flex flex-col items-stretch justify-center h-screen w-full bg-gray-50">
    <Suspense fallback={<div>Loading...</div>}>
      <ScenarioContent
        title={scenario.title}
        description={scenario.description}
        startMessage={scenario.startMessage}
        prompt={scenario.prompt}
        avatar={scenario.avatar}
        backgroundImageUrl={scenario.backgroundImageUrl}
        voice={scenario.voice}
      />
    </Suspense>
    </div>
  );
}

export default TemusAvatarCustomerPage