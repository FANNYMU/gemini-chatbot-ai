import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatHistory } from './components/ChatHistory';
import { LoadingDots } from './components/LoadingDots';
import { Message, ChatState } from './types';
import { chatWithGemini } from './lib/gemini';

function App() {
  const [state, setState] = useState<ChatState>(() => {
    const saved = localStorage.getItem('gemini-chat-state');
    return saved ? {
      ...JSON.parse(saved),
      messages: JSON.parse(saved).messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    } : {
      messages: [],
      isLoading: false,
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('gemini-chat-state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (content: string, imageFile?: File) => {
    let imageUrl: string | undefined;
    
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
      image: imageUrl
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true
    }));

    // Close mobile menu when sending a message
    setIsMobileMenuOpen(false);

    try {
      const response = await chatWithGemini(content, imageFile);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      const errorResponse: Message = {
        id: crypto.randomUUID(),
        content: `⚠️ ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorResponse],
        isLoading: false
      }));
    }
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setState(prev => ({ ...prev, messages: [] }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className={`h-screen flex ${state.isDarkMode ? 'dark bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-all duration-300 ease-in-out lg:relative
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full lg:w-0'}
          ${state.isDarkMode ? 'bg-zinc-900' : 'bg-white'} 
          border-r border-gray-200 dark:border-gray-700`}
      >
        <ChatHistory
          messages={state.messages}
          isDarkMode={state.isDarkMode}
          onClearHistory={clearHistory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
              title="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-xl font-semibold">Gemini</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {state.isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {state.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Start a conversation with Gemini
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {state.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isDarkMode={state.isDarkMode}
                />
              ))}
              {state.isLoading && (
                <div className="p-6">
                  <LoadingDots />
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading}
          isDarkMode={state.isDarkMode}
        />
      </div>
    </div>
  );
}

export default App;