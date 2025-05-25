export interface Scenario {
  id: string;
  title: string;
  description: string;
  href: string;
  startMessage: string;
  prompt: string;
  avatar: string;
  backgroundImageUrl: string;
  voice: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'temus-avatar-customer',
    title: 'AI Chat Assistant',
    description: 'Have a natural conversation with your AI avatar! Ask questions, get advice, or just chat about anything you want.',
    href: '/temus-avatar-customer',
    startMessage: 'Hi! I\'m your AI assistant. What would you like to talk about today?',
    prompt: "You are a friendly and helpful AI assistant. You can help with a wide variety of topics including answering questions, providing advice, explaining concepts, having casual conversations, and more. Keep your responses conversational and engaging, but concise (2-3 sentences unless more detail is specifically requested). Be personable and show interest in what the user wants to discuss.",
    avatar: 'michelle',
    backgroundImageUrl: 'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    voice: 'michelle'
  },
]; 
