import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor.tsx';
import PreviewPanel from './PreviewPanel.tsx';
import Sidebar from './Sidebar.tsx';
import TabBar from './TabBar.tsx';
import { useIDEStore } from './useIDEStore.ts';

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
        className="flex flex-shrink-0 items-center justify-between px-4 py-2"
        style={{
          background: isDark ? '#0d0d1a' : '#e8eaf6',
          borderBottom: `1px solid ${isDark ? '#1e1e3a' : '#d0d0e0'}`,
          height: '48px',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger button — mobile only */}
          {isMobile && (
            <button
              aria-label="Toggle sidebar"
              className="flex items-center justify-center rounded-lg text-base transition-all hover:opacity-80 active:scale-95"
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
              ☰
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
                          height: '50%',
                          width: '100%',
                          borderBottom: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        }
                      : {
                          width: '50%',
                          borderRight: `1px solid ${isDark ? '#313244' : '#d0d0e0'}`,
                        }
                    : { width: '100%' }
                }
              >
                {/* Editor status bar */}
                <div
                  className="flex flex-shrink-0 items-center justify-between px-3 py-1"
                  style={{
                    background: isDark ? '#1e1e2e' : '#f0f0f8',
                    borderBottom: `1px solid ${isDark ? '#313244' : '#e0e0ee'}`,
                  }}
                >
                  {activeFile && (
                    <>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isDark ? '#8892b0' : '#555577' }}
                      >
                        {activeFile.language.toUpperCase()}
                      </span>
                      <span className="text-xs" style={{ color: isDark ? '#6c7086' : '#888899' }}>
                        {activeFile.content.split('\n').length} lines
                      </span>
                    </>
                  )}
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
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ color: isDark ? '#6c7086' : '#aaaacc' }}
                    >
                      <div className="text-center">
                        <p className="text-4xl">📂</p>
                        <p className="mt-2 text-sm">Select or create a file</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Panel */}
            {(previewMode === 'preview' || previewMode === 'split') && (
              <div
                className="flex flex-col overflow-hidden"
                style={
                  previewMode === 'split'
                    ? splitIsVertical
                      ? { height: '50%', width: '100%' }
                      : { width: '50%' }
                    : { width: '100%' }
                }
              >
                <PreviewPanel files={files} activeFile={activeFile} />
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
              {activeFile && (
                <span className="max-w-[160px] truncate text-xs text-white/80">
                  {activeFile.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-white/80">NexCode IDE</span>
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
