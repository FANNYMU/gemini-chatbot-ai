import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
  messages: Message[];
  isDarkMode: boolean;
  onClearHistory: () => void;
}

export function ChatHistory({ messages, isDarkMode, onClearHistory }: ChatHistoryProps) {
  // Group messages by date (today, yesterday, older)
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group = 'Older';
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="w-12 h-12 mb-4 text-gray-400" />
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No chat history yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Chat History</h2>
        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-red-500 transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="p-4">
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {date}
            </h3>
            <div className="space-y-3">
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-zinc-800/50 hover:bg-zinc-800'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}