"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/ui/mermaid";

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isMermaid = match && match[1] === "mermaid";

                        if (isMermaid) {
                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
