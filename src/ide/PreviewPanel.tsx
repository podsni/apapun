import { useEffect, useRef, useState } from 'react';
import type { FileTab } from './types.ts';

interface PreviewPanelProps {
  files: Array<FileTab>;
  activeFile: FileTab | null;
  theme?: 'dark' | 'light';
}

function buildHTMLPreview(files: Array<FileTab>): string {
  // Find the active HTML file or use the first HTML file
  const htmlFile = files.find((f) => f.language === 'html');
  const cssFiles = files.filter((f) => f.language === 'css');
  const jsFiles = files.filter((f) => f.language === 'javascript');

  if (htmlFile) {
    let html = htmlFile.content;

    // Inject CSS files that are linked
    for (const cssFile of cssFiles) {
      const linkRegex = new RegExp(`<link[^>]+href=["']${cssFile.name}["'][^>]*>`, 'gi');
      html = html.replace(linkRegex, `<style>\n${cssFile.content}\n</style>`);
    }

    // Inject JS files that are referenced
    for (const jsFile of jsFiles) {
      const scriptRegex = new RegExp(
        `<script[^>]+src=["']${jsFile.name}["'][^>]*><\\/script>`,
        'gi',
      );
      html = html.replace(scriptRegex, `<script>\n${jsFile.content}\n</script>`);
    }

    return html;
  }

  return '';
}

function buildJSXPreview(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSX Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
${content}
  </script>
</body>
</html>`;
}

function buildSingleFilePreview(file: FileTab): string {
  switch (file.language) {
    case 'css':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${file.content}</style>
</head>
<body>
  <div class="preview-note" style="padding:1rem;font-family:system-ui;">
    <h2>CSS Preview</h2>
    <p>This is a live CSS preview. The styles above are applied to this page.</p>
    <div class="box" style="margin:1rem 0;padding:1rem;border:1px solid #ccc;">Sample Box</div>
    <button>Sample Button</button>
  </div>
</body>
</html>`;
    case 'javascript':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui; padding: 1rem; background: #1e1e1e; color: #d4d4d4; }
    #console-output { background: #252526; border-radius: 8px; padding: 1rem; font-family: monospace; white-space: pre-wrap; }
    .log { color: #d4d4d4; } .error { color: #f48771; } .warn { color: #dcdcaa; }
  </style>
</head>
<body>
  <h3 style="color:#569cd6;margin-bottom:0.5rem;">Console Output</h3>
  <div id="console-output"></div>
  <script>
    const output = document.getElementById('console-output');
    const origLog = console.log, origError = console.error, origWarn = console.warn;
    function appendLog(text, cls) {
      const el = document.createElement('div');
      el.className = cls;
      el.textContent = text;
      output.appendChild(el);
    }
    console.log = (...args) => { origLog(...args); appendLog(args.map(String).join(' '), 'log'); };
    console.error = (...args) => { origError(...args); appendLog(args.map(String).join(' '), 'error'); };
    console.warn = (...args) => { origWarn(...args); appendLog(args.map(String).join(' '), 'warn'); };
    window.onerror = (msg, src, line) => { appendLog(\`Error at line \${line}: \${msg}\`, 'error'); };
  </script>
  <script>${file.content}</script>
</body>
</html>`;
    case 'markdown':
      // Very basic markdown rendering
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #333; }
    h1,h2,h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
    pre code { display: block; padding: 1rem; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
    a { color: #0366d6; }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(file.content)});
  </script>
</body>
</html>`;
    default:
      return '';
  }
}

const pulseKeyframes = `
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
`;

export default function PreviewPanel({ files, activeFile, theme = 'dark' }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContentRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [hasContent, setHasContent] = useState(false);

  const isDark = theme !== 'light';

  // Theme-dependent colors
  const headerBg = isDark ? '#16213e' : '#e8eaf6';
  const headerBorder = isDark ? '#0f3460' : '#d0d0e0';
  const panelBg = isDark ? '#1a1a2e' : '#f0f2f8';
  const labelColor = isDark ? '#8892b0' : '#5c6080';
  const buttonHoverBg = isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.12)';

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setError(null);
    setIsLoading(true);

    let previewContent = '';

    // Check if there's an HTML file - use multi-file preview
    const hasHTML = files.some((f) => f.language === 'html');

    if (hasHTML) {
      previewContent = buildHTMLPreview(files);
    } else if (activeFile) {
      if (activeFile.language === 'jsx' || activeFile.language === 'tsx') {
        previewContent = buildJSXPreview(activeFile.content);
      } else {
        previewContent = buildSingleFilePreview(activeFile);
      }
    }

    if (!previewContent) {
      previewContentRef.current = '';
      setHasContent(false);
      setIsLoading(false);
      return;
    }

    previewContentRef.current = previewContent;
    setHasContent(true);

    const blob = new Blob([previewContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    const handleLoad = () => {
      setIsLoading(false);
      URL.revokeObjectURL(url);
    };

    iframe.addEventListener('load', handleLoad, { once: true });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [files, activeFile, refreshCount]);

  function handleOpenInNewTab() {
    const content = previewContentRef.current;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a short delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function handleRefresh() {
    setRefreshCount((c) => c + 1);
  }

  return (
    <div className="flex h-full flex-col" style={{ background: panelBg }}>
      {/* Inject pulse keyframes */}
      <style>{pulseKeyframes}</style>

      {/* Preview header */}
      <div
        style={{
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          gap: '8px',
          minHeight: '36px',
          flexShrink: 0,
        }}
      >
        {/* Left: traffic lights + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#ff5f56',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#ffbd2e',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#27c93f',
                flexShrink: 0,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Pulsing live dot */}
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#27c93f',
                flexShrink: 0,
                animation: 'livePulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: labelColor,
                letterSpacing: '0.04em',
                userSelect: 'none',
              }}
            >
              Preview
            </span>
          </div>
        </div>

        {/* Right: loading indicator + refresh + open in new tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid #667eea',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              <span style={{ fontSize: '10px', color: labelColor }}>Loading…</span>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            title="Reload preview"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '3px 5px',
              borderRadius: '4px',
              fontSize: '13px',
              lineHeight: 1,
              color: labelColor,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = buttonHoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            🔄
          </button>

          {/* Open in new tab button */}
          <button
            onClick={handleOpenInNewTab}
            disabled={!hasContent}
            title="Open preview in new tab"
            style={{
              background: hasContent
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : isDark
                  ? 'rgba(102,126,234,0.2)'
                  : 'rgba(102,126,234,0.15)',
              border: 'none',
              borderRadius: '5px',
              color: hasContent ? '#fff' : labelColor,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              padding: '3px 8px',
              lineHeight: '16px',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.15s, transform 0.1s',
              opacity: hasContent ? 1 : 0.5,
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (hasContent) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              if (hasContent) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
            onMouseDown={(e) => {
              if (hasContent)
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)';
            }}
            onMouseUp={(e) => {
              if (hasContent) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            ⤢ Open
          </button>
        </div>
      </div>

      {/* Spin keyframe for loading spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* iframe / empty state */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: panelBg,
              color: '#ff5f56',
              padding: '1rem',
            }}
          >
            <p style={{ fontSize: '13px', textAlign: 'center' }}>{error}</p>
          </div>
        )}

        {!hasContent && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: panelBg,
              gap: '12px',
              padding: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                lineHeight: 1,
                opacity: 0.35,
                filter: isDark ? 'brightness(1.4)' : 'none',
              }}
            >
              🖥️
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: labelColor,
                  marginBottom: '4px',
                }}
              >
                No preview available
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: isDark ? '#4a5568' : '#9096b0',
                  maxWidth: '200px',
                  lineHeight: 1.5,
                }}
              >
                Open an HTML, CSS, JS, JSX, or Markdown file to see a live preview here.
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#fff',
            display: hasContent ? 'block' : 'none',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          title="Preview"
        />
      </div>
    </div>
  );
}
