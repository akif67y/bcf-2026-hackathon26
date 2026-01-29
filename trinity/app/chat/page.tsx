'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

export default function ChatPage() {
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        onError: (err) => console.error('Chat error:', err),
    });

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isLoading = status === 'submitted' || status === 'streaming';

    // Debug logging
    useEffect(() => {
        console.log('Chat status:', status, 'Messages:', messages.length, 'Error:', error);
    }, [status, messages, error]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const suggestions = [
        "Explain binary search with an example",
        "What is recursion?",
        "How do sorting algorithms work?",
        "Explain Big O notation"
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
        }
    };

    // Helper to extract text from message parts
    const getMessageText = (m: typeof messages[0]) => {
        console.log('Message structure:', JSON.stringify(m, null, 2));
        if (m.parts && m.parts.length > 0) {
            const text = m.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map(p => p.text)
                .join('');
            console.log('Extracted text from parts:', text);
            return text;
        }
        console.log('Using content fallback:', m.content);
        return m.content || '';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Trinity AI Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                    Search materials, get explanations, or generate content
                </p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm shadow-lg relative">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-6 pb-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20 space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Trinity AI</h3>
                                    <p className="max-w-md mx-auto">
                                        I can help you understand programming concepts, explain algorithms,
                                        and answer your computer science questions.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-6">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => {
                            const text = getMessageText(m);
                            return (
                                <div
                                    key={m.id}
                                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role !== 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    <Card
                                        className={`p-4 max-w-[80%] shadow-sm ${m.role === 'user'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                                            : 'bg-card'
                                            }`}
                                    >
                                        <div className={`prose dark:prose-invert prose-sm max-w-none ${m.role === 'user' ? 'text-white prose-headings:text-white prose-p:text-white prose-strong:text-white' : ''
                                            }`}>
                                            {m.role === 'assistant' && text ? (
                                                <MarkdownRenderer content={text} />
                                            ) : (
                                                <p className="whitespace-pre-wrap m-0">{text}</p>
                                            )}
                                        </div>
                                    </Card>

                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Error display */}
                        {error && (
                            <div className="flex gap-3 justify-start">
                                <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                    <div className="text-red-600 dark:text-red-400 text-sm">
                                        Error: {error.message || 'Something went wrong'}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <Card className="p-4 bg-card">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about programming..."
                    className="flex-1 bg-background/80 backdrop-blur-sm"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    );
}
