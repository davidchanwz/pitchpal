"use client";

import Conversation from "@/components/Conversation";
import Presentation from "@/components/Presentation";
import StartConversationButton from "@/components/StartConversationButton";
import { useState } from "react";

export default function PresentationPage() {
  const [conversationStarted, setConversationStarted] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Presentation Viewer</h1>


      <Presentation presentationLink="" avatar="" />
    </div>
  );
}
