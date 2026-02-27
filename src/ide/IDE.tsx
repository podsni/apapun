import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor.tsx';
import PreviewPanel from './PreviewPanel.tsx';
import Sidebar from './Sidebar.tsx';
import TabBar from './TabBar.tsx';
import { useIDEStore } from './useIDEStore.ts';

// Language color dots for the editor status bar (desktop)
const LANG_COLORS: Record<string, string> = {
  html: '#e34c26',
  css: '#264de4',
  javascript: '#f7df1e',
  typescript: '#3178c6',
  jsx: '#61dafb',
  tsx: '#61dafb',
  json: '#5bb974',
  markdown: '#083fa1',
};

export default function IDE() {
  const store = useIDEStore();

  const {
    files,
    activeFile,
    activeFileId,
    theme,
    fontSize,
    previewMode,
    setActiveFileId,
    setTheme,
    setFontSize,
    setPreviewMode,
    updateFileContent,
    addFile,
    removeFile,
    renameFile,
    uploadFile,
  } = store;

  const isDark = theme === 'dark';

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // In split mode on mobile: stack vertically; on desktop: side-by-side
  const splitIsVertical = isMobile && previewMode === 'split';

  const langColor = activeFile
    ? (LANG_COLORS[activeFile.language.toLowerCase()] ?? '#a78bfa')
    : '#a78bfa';

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{
        background: isDark ? '#12121f' : '#f5f5ff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top bar */}
      <header
        className="flex flex-shrink-0 items-center justify-between px-4"
        style={{
          background: isDark ? '#0d0d1a' : '#e8eaf6',
          borderBottom: `1px solid ${isDark ? '#1e1e3a' : '#d0d0e0'}`,
          height: isMobile ? '52px' : '48px',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger button — mobile only */}
          {isMobile && (
            <button
              aria-label="Toggle sidebar"
              className="flex items-center justify-center rounded-lg transition-all hover:opacity-80 active:scale-95"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                color: isDark ? '#a78bfa' : '#667eea',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {/* Three-line hamburger SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          )}

          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
            }}
          >
            {'</>'}
          </div>
          <div>
            <h1
              className="text-sm leading-none font-bold"
              style={{
                background: 'linear-gradient(135deg, #667eea, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NexCode IDE
            </h1>
            {!isMobile && (
              <p className="mt-0.5 text-xs" style={{ color: isDark ? '#6c7086' : '#888899' }}>
                Online Code Editor
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language badges — desktop only */}
          {!isMobile && (
            <div className="flex gap-1">
              {(['HTML', 'CSS', 'JS', 'JSX', 'TS', 'JSON'] as const).map((lang) => (
                <span
                  key={lang}
                  className="rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    background: isDark ? '#1e1e3a' : '#dde1f5',
                    color: isDark ? '#667eea' : '#4a5568',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          )}

          {/* Preview quick-access button — mobile only */}
          {isMobile && (
            <button
              aria-label="Switch to preview"
              className="flex items-center justify-center rounded-lg transition-all hover:opacity-80 active:scale-95"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                color: isDark ? '#a78bfa' : '#667eea',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewMode('preview')}
            >
              {/* Eye icon SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 4C5.5 4 2 10 2 10s3.5 6 8 6 8-6 8-6-3.5-6-8-6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )}

          {/* Run button */}
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
              minHeight: '44px',
              minWidth: isMobile ? '44px' : 'auto',
              paddingTop: isMobile ? '0' : '6px',
              paddingBottom: isMobile ? '0' : '6px',
            }}
            onClick={() => setPreviewMode('preview')}
          >
            ▶{!isMobile && ' Run'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar — always visible on desktop; overlay drawer on mobile */}
        {isMobile ? (
          <>
            {/* Backdrop overlay */}
            {sidebarOpen && (
              <div
                className="absolute inset-0 z-20"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onClick={() => setSidebarOpen(false)}
              />
            )}
            {/* Drawer */}
            <div
              className="absolute top-0 left-0 z-30 h-full overflow-hidden transition-transform duration-300"
              style={{
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                width: '260px',
              }}
            >
              <Sidebar
                files={files}
                activeFileId={activeFileId ?? ''}
                theme={theme}
                fontSize={fontSize}
                onSelectFile={handleSelectFile}
                onAddFile={addFile}
                onRemoveFile={removeFile}
                onRenameFile={renameFile}
                onUploadFile={uploadFile}
                onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                onFontSizeChange={setFontSize}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        ) : (
          <Sidebar
            files={files}
            activeFileId={activeFileId ?? ''}
            theme={theme}
            fontSize={fontSize}
            onSelectFile={handleSelectFile}
            onAddFile={addFile}
            onRemoveFile={removeFile}
            onRenameFile={renameFile}
            onUploadFile={uploadFile}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onFontSizeChange={setFontSize}
            isOpen={true}
            onClose={() => {}}
          />
        )}

        {/* Editor + Preview area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab bar */}
          <TabBar
            files={files}
            activeFileId={activeFileId ?? ''}
            theme={theme}
            previewMode={previewMode}
            onSelectFile={setActiveFileId}
            onCloseFile={removeFile}
            onPreviewModeChange={setPreviewMode}
          />

          {/* Editor / Preview panels */}
          <div
            className="flex flex-1 overflow-hidden"
            style={{
              flexDirection: splitIsVertical ? 'column' : 'row',
            }}
          >
            {/* Code Editor */}
            {(previewMode === 'editor' || previewMode === 'split') && (
              <div
                className="flex flex-col overflow-hidden"
                style={
                  previewMode === 'split'
                    ? splitIsVertical
                      ? {
                          height: '40%',
                          width: '100%',
                        }
                      : {
                          width: '50%',
                          borderRight: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        }
                    : { width: '100%' }
                }
              >
                {/* Editor info bar */}
                <div
                  className="flex flex-shrink-0 items-center justify-between px-3 py-1"
                  style={{
                    background: isDark ? '#1e1e2e' : '#f0f0f8',
                    borderBottom: `1px solid ${isDark ? '#313244' : '#e0e0ee'}`,
                  }}
                >
                  {activeFile ? (
                    <>
                      {/* Language chip with color dot */}
                      <span
                        className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: isDark ? '#2a2a3e' : '#e4e4f4',
                          color: isDark ? '#c0caf5' : '#333355',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: langColor,
                            flexShrink: 0,
                          }}
                        />
                        {activeFile.language.toUpperCase()}
                      </span>
                      <span className="text-xs" style={{ color: isDark ? '#6c7086' : '#888899' }}>
                        {activeFile.content.split('\n').length} lines
                      </span>
                    </>
                  ) : null}
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                  {activeFile ? (
                    <CodeEditor
                      key={activeFile.id}
                      content={activeFile.content}
                      language={activeFile.language}
                      theme={theme}
                      fontSize={fontSize}
                      onChange={(value) => updateFileContent(activeFile.id, value)}
                    />
                  ) : (
                    /* Empty state with gradient icon */
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ color: isDark ? '#6c7086' : '#aaaacc' }}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        {/* Gradient folder icon */}
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea22 0%, #764ba244 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isDark
                              ? '0 4px 24px rgba(102,126,234,0.15)'
                              : '0 4px 24px rgba(102,126,234,0.10)',
                          }}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id="folderGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#667eea" />
                                <stop offset="100%" stopColor="#a78bfa" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M4 10C4 8.9 4.9 8 6 8h8l3 3h9c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10z"
                              fill="url(#folderGrad)"
                              opacity="0.85"
                            />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: isDark ? '#c0caf5' : '#555577' }}
                          >
                            No file open
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: isDark ? '#6c7086' : '#aaaacc' }}
                          >
                            Select or create a file to start editing
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Divider hint in split mode */}
            {previewMode === 'split' && (
              <div
                aria-hidden="true"
                style={
                  splitIsVertical
                    ? {
                        width: '100%',
                        height: '8px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark ? '#181828' : '#e8eaf6',
                        borderTop: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        borderBottom: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        cursor: 'row-resize',
                        userSelect: 'none',
                      }
                    : {
                        width: '8px',
                        height: '100%',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark ? '#181828' : '#e8eaf6',
                        borderLeft: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        borderRight: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        cursor: 'col-resize',
                        userSelect: 'none',
                      }
                }
              >
                {/* Drag hint dots */}
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: splitIsVertical ? '2px' : '0',
                    writingMode: splitIsVertical ? 'horizontal-tb' : 'vertical-rl',
                    color: isDark ? '#44445a' : '#b0b0cc',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  ⋮⋮
                </span>
              </div>
            )}

            {/* Preview Panel */}
            {(previewMode === 'preview' || previewMode === 'split') && (
              <div
                className="flex flex-col overflow-hidden"
                style={
                  previewMode === 'split'
                    ? splitIsVertical
                      ? { height: '60%', width: '100%' }
                      : { width: '50%' }
                    : { width: '100%' }
                }
              >
                <PreviewPanel files={files} activeFile={activeFile} theme={theme} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <footer
        className="flex flex-shrink-0 items-center justify-between px-4 py-1"
        style={{
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          height: '24px',
        }}
      >
        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              {activeFile ? (
                /* Clickable filename toggles sidebar */
                <button
                  className="flex items-center gap-1 truncate"
                  style={{
                    maxWidth: '160px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <span className="truncate text-xs text-white/90 underline-offset-2 hover:underline">
                    {activeFile.name}
                  </span>
                </button>
              ) : (
                <span className="text-xs text-white/50">No file open</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle button */}
              <button
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="flex items-center gap-1 text-xs text-white/80 transition-opacity hover:text-white active:opacity-70"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
                    </svg>
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
                    </svg>
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-white/80">NexCode IDE</span>
              <span
                className="rounded px-1.5 py-0.5 text-xs font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.75)',
                  letterSpacing: '0.02em',
                }}
              >
                v1.0
              </span>
              {activeFile && (
                <span className="text-xs text-white/70">
                  {activeFile.name} · {activeFile.language.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/70">Font: {fontSize}px</span>
              <span className="text-xs text-white/70">
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </span>
              <span className="text-xs text-white/70">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            </div>
          </>
        )}
      </footer>
    </div>
  );
}
