import { useEffect, useRef, useState } from 'react';
import type { FileTab } from './types.ts';

interface PreviewPanelProps {
  files: Array<FileTab>;
  activeFile: FileTab | null;
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
      const linkRegex = new RegExp(
        `<link[^>]+href=["']${cssFile.name}["'][^>]*>`,
        'gi',
      );
      html = html.replace(
        linkRegex,
        `<style>\n${cssFile.content}\n</style>`,
      );
    }

    // Inject JS files that are referenced
    for (const jsFile of jsFiles) {
      const scriptRegex = new RegExp(
        `<script[^>]+src=["']${jsFile.name}["'][^>]*><\\/script>`,
        'gi',
      );
      html = html.replace(
        scriptRegex,
        `<script>\n${jsFile.content}\n</script>`,
      );
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

export default function PreviewPanel({ files, activeFile }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsLoading(false);
      return;
    }

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
  }, [files, activeFile]);

  return (
    <div className="flex h-full flex-col" style={{ background: '#1a1a2e' }}>
      {/* Preview header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: '#16213e',
          borderBottom: '1px solid #0f3460',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: '#ff5f56' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#ffbd2e' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#27c93f' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: '#8892b0' }}>
            Preview
          </span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 animate-spin rounded-full border-2"
              style={{ borderColor: '#667eea', borderTopColor: 'transparent' }}
            />
            <span className="text-xs" style={{ color: '#8892b0' }}>
              Loading...
            </span>
          </div>
        )}
      </div>

      {/* iframe */}
      <div className="relative flex-1">
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#1a1a2e', color: '#ff5f56' }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          title="Preview"
          style={{ background: '#fff' }}
        />
      </div>
    </div>
  );
}
