import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';

type Props = { children: string };

export function Markdown({ children }: Props) {
  const { theme } = useTheme();
  const style = theme === 'dark' ? oneDark : oneLight;

  return (
    <div className="prose-article max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...rest }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (inline || !match) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                language={match[1]}
                style={style}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  background: 'transparent',
                }}
                codeTagProps={{
                  style: { fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          pre({ children }: any) {
            return (
              <pre className="bg-bg-alt border border-border rounded-xl my-5 overflow-x-auto">
                {children}
              </pre>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
