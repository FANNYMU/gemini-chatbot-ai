import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, imageFile?: File) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isDarkMode }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`; // Cap at 200px
    }
  }, [message]);

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message, selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      {previewUrl && (
        <div className="mb-4 relative inline-block">
          <img
            src={previewUrl}
            alt="Selected"
            className="max-h-48 rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className={`relative flex items-start gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
        <div className="flex flex-col gap-2 pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageClick}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Ask me about this image..." : "Message Gemini..."}
            className={`w-full resize-none bg-transparent outline-none min-h-[56px] py-2 text-base leading-6 ${
              isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
            disabled={isLoading}
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              message.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message.length} / 32,000 characters
      </div>
    </form>
  );
}