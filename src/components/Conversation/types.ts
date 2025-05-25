import React from "react"

export interface ConversationProps {
  conversationId: string
  startMessage: string
  prompt: string
  avatar: string
  backgroundImageUrl?: string | null
  voice: string
  children?: React.ReactNode
  onVideoReady?: () => void
  setConversationAvatarType?: (type: "avatar" | "audio") => void
  setThinkingState?: (thinking: boolean) => void
  onConversationEnd?: () => void
  onWebsocketMessage?: (message: AvatarWebsocketMessage) => void
  conversationSetupParams?: Record<string, any>
  muted?: boolean
  audioTrack?: MediaStreamTrack | null;
}

export interface AvatarWebsocketName {
  type: 'name'
  name: string
}

export interface AvatarWebsocketStatus {
  type: 'status'
  status: 'ready'
  avatar_uuid?: string
}

export interface AvatarWebsocketThinkingState {
  type: 'thinkingState'
  thinking: boolean
}

export interface AvatarWebsocketOffer {
  type: 'offer'
}

export interface AvatarWebsocketAnswer {
  type: 'answer'
  answer: RTCSessionDescriptionInit
}

export interface AvatarWebsocketIceCandidate {
  type: 'ice-candidate'
  candidate: RTCIceCandidate
}

export interface AvatarWebsocketEndCall {
  type: 'end_call'
}

export interface GenericAvatarWebsocketMessage {
  type: string
}

export type AvatarWebsocketMessage = {
  type: "status";
  avatar_uuid: string;
} | {
  type: "answer";
  answer: RTCSessionDescriptionInit;
} | {
  type: "ice-candidate";
  candidate: RTCIceCandidateInit;
} | {
  type: "name";
  name: string;
} | {
  type: "thinkingState";
  thinking: boolean;
} | {
  type: "end_call";
} | {
  type: "error";
  error: string;
};
