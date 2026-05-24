import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  onClose: () => void;
  onExpenseChange?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPanel = ({ onClose, onExpenseChange }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your expense tracking assistant. I can help you analyze your expenses, provide insights, and answer questions about your financial data. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({ query: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response },
      ]);
      
      const responseText = response.response.toLowerCase();
      const expenseKeywords = [
        'added',
        'inserted',
        'saved',
        'created',
        'record added',
        'expense added',
        'successfully added',
        '✅',
        'updated',
        'record updated',
        'expense updated',
        'successfully updated',
        'deleted',
        'record deleted',
        'expense deleted',
        'successfully deleted',
        'removed',
        'record removed',
        'insert into',
        'has been added',
        'has been updated',
        'has been deleted'
      ];
      
      const userMessageLower = userMessage.toLowerCase();
      const userIntentKeywords = ['add', 'create', 'insert', 'save', 'update', 'edit', 'delete', 'remove'];
      const hasUserIntent = userIntentKeywords.some(keyword => 
        userMessageLower.includes(keyword)
      );
      
      const hasExpenseChange = expenseKeywords.some(keyword => 
        responseText.includes(keyword)
      ) || (hasUserIntent && (responseText.includes('success') || responseText.includes('done') || responseText.includes('complete')));
      
      if (hasExpenseChange && onExpenseChange) {
        setTimeout(() => {
          onExpenseChange();
          toast.success('Expense list refreshed');
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-white/20">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI Assistant
              <Sparkles className="w-4 h-4" />
            </h2>
            <p className="text-xs text-white/80">Your expense helper</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your expenses..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 hover:border-indigo-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
