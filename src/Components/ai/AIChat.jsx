import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat({ business, reviews, deals }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context from business data
      const context = `
Business: ${business.name}
Category: ${business.category}
Description: ${business.description || 'No description'}
Price Level: ${business.priceLevel}
Tags: ${business.tags?.join(', ') || 'None'}
Hours: ${business.hours || 'Not specified'}
Average Rating: ${business.averageRating}/5 (${business.reviewCount} reviews)

Recent Reviews:
${reviews?.slice(0, 5).map(r => `- ${r.rating}/5: ${r.reviewText}`).join('\n') || 'No reviews yet'}

Active Deals:
${deals?.filter(d => new Date(d.endDate) > new Date()).map(d => `- ${d.title}: ${d.description}`).join('\n') || 'No active deals'}
      `;

      const prompt = `You are LocalLift AI, a helpful assistant for local businesses. Answer the user's question about ${business.name} using ONLY the information provided below. Be concise, friendly, and helpful. If you don't have the information, say so politely.

${context}

User Question: ${input}

Answer:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const aiMessage = { role: 'ai', content: response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">LocalLift AI Assistant</h3>
          <p className="text-xs text-slate-600">Ask me anything about this business</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          AI-generated responses. Please verify important information directly with the business.
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.error
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Does this place have vegetarian options?"
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {['Is it kid-friendly?', 'What are the best times to visit?', 'Any vegetarian options?'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}