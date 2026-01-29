'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        api: '/api/chat',
        maxSteps: 5,
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const suggestions = [
        "Explain the key concepts from lecture 1",
        "What are the main topics covered?",
        "Help me understand the code examples"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Academic Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                    Ask questions about your uploaded course materials
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
                                    <h3 className="text-lg font-semibold text-foreground">Academic Assistant</h3>
                                    <p className="max-w-md mx-auto">
                                        Ask me anything about your uploaded course materials. I can search through PDFs,
                                        lecture notes, and other documents to help you learn.
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

                        {messages.map((m) => (
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
                                        {m.role === 'assistant' && m.content ? (
                                            <MarkdownRenderer content={m.content} />
                                        ) : (
                                            <p className="whitespace-pre-wrap m-0">{m.content}</p>
                                        )}
                                    </div>
                                </Card>

                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <Card className="p-4 bg-card">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Searching course materials...</span>
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
                    onChange={handleInputChange}
                    placeholder="Ask a question about your course materials..."
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
