import React from 'react';

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-foreground/90 leading-relaxed font-sans text-sm md:text-base">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold tracking-tight text-indigo-400 mt-8 mb-4 border-b border-border/40 pb-2">
              {trimmed.substring(2)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-semibold tracking-tight text-indigo-300 mt-6 mb-3">
              {trimmed.substring(3)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-medium tracking-tight text-indigo-200 mt-4 mb-2">
              {trimmed.substring(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const rawText = trimmed.substring(2);
          const parts = rawText.split('**');
          return (
            <div key={index} className="flex items-start gap-2 ml-4 my-1">
              <span className="mt-2.5 flex h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-muted-foreground">
                {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part)}
              </span>
            </div>
          );
        }
        if (trimmed === '---') {
          return <hr key={index} className="my-6 border-border/40" />;
        }
        if (trimmed.length === 0) {
          return null;
        }

        const parts = line.split('**');
        return (
          <p key={index} className="text-muted-foreground">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
}
