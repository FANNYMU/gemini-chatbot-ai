export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isDarkMode: boolean;
}