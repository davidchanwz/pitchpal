"use client";

import Presentation from "@/components/Presentation";

export default function PresentationPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Presentation Viewer</h1>
      <Presentation />
    </div>
  );
}
