import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle2, Bot } from 'lucide-react';
import { Message } from '../types';
import { formatMarkdown } from '../lib/markdown';

interface ChatMessageProps {
  message: Message;
  isDarkMode: boolean;
}

export function ChatMessage({ message, isDarkMode }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-transparent' : isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <UserCircle2 className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        ) : (
          <Bot className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isUser ? 'You' : 'Gemini'}
        </div>
        {message.image && (
          <img
            src={message.image}
            alt="Uploaded content"
            className="max-w-sm rounded-lg object-contain mb-2"
          />
        )}
        <div 
          className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}
          dangerouslySetInnerHTML={{ 
            __html: isUser ? message.content : formatMarkdown(message.content)
          }}
        />
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}