'use client';
import { useState } from "react";

export default function AIChatBox({ routeData }: { routeData: any }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, routeData }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        throw new Error('No reply received from AI');
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${e.message || 'Failed to get response from AI.'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Container */}
      <div className={`
        w-[360px] md:w-[420px] 
        bg-white/95 backdrop-blur-xl 
        rounded-2xl shadow-2xl border border-gray-100
        transition-all duration-300 ease-out
        ${isMinimized ? 'h-16' : 'h-[500px]'}
        flex flex-col overflow-hidden
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Route Assistant</h3>
              <p className="text-xs text-gray-500">Ask me anything about your route</p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/70 rounded-lg transition-colors duration-200"
          >
            <svg 
              className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${isMinimized ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Start a conversation about your route</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`
                    max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-gray-50 text-gray-800 border border-gray-100'
                    }
                    transform transition-all duration-200 hover:scale-[1.02]
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                             transition-all duration-200 resize-none"
                    placeholder="Ask about your route..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={loading}
                  />
                </div>
                <button
                  className={`
                    p-3 rounded-xl transition-all duration-200 transform
                    ${input.trim() && !loading
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 hover:from-blue-600 hover:to-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

