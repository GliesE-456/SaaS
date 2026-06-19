interface DiffLineProps {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

export function DiffLine({ type, content }: DiffLineProps) {
  if (type === 'unchanged') {
    return (
      <div className="flex px-4 py-1 font-mono text-sm text-muted-foreground/60 hover:bg-muted/10">
        <span className="w-6 select-none opacity-50 text-right pr-2"></span>
        <span className="whitespace-pre-wrap break-words flex-1">{content}</span>
      </div>
    );
  }

  return (
    <div className={`flex px-4 py-1 font-mono text-sm ${type === 'added' ? 'diff-added' : 'diff-removed'}`}>
      <span className="w-6 select-none opacity-50 text-right pr-2">
        {type === 'added' ? '+' : '-'}
      </span>
      <span className="whitespace-pre-wrap break-words flex-1">{content}</span>
    </div>
  );
}
