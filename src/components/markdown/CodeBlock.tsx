import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';

type Props = { code: string; language?: string };

export function CodeBlock({ code, language = 'rust' }: Props) {
  const { theme } = useTheme();
  const style = theme === 'dark' ? oneDark : oneLight;

  return (
    <div className="bg-bg-alt border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border font-mono text-[10px]
                      uppercase tracking-wider text-text-muted">
        {language}
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={style}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
          codeTagProps={{
            style: { fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
