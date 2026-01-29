"use client";
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default" });

export default function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.run({ nodes: [ref.current] });
        }
    }, [chart]);

    return (
        <div className="mermaid flex justify-center p-4 bg-white/50 rounded border border-border/50 my-4 overflow-x-auto" ref={ref}>
            {chart}
        </div>
    );
}
