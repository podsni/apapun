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
              className="text-sm font-bold leading-none"
              style={{
                background: 'linear-gradient(135deg, #667eea, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NexCode IDE
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: isDark ? '#6c7086' : '#888899' }}>
              Online Code Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language badges */}
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

          {/* Run button */}
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
            }}
            onClick={() => setPreviewMode('preview')}
          >
            ▶ Run
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          files={files}
          activeFileId={activeFileId ?? ''}
          theme={theme}
          fontSize={fontSize}
          onSelectFile={setActiveFileId}
          onAddFile={addFile}
          onRemoveFile={removeFile}
          onRenameFile={renameFile}
          onUploadFile={uploadFile}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onFontSizeChange={setFontSize}
        />

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
          <div className="flex flex-1 overflow-hidden">
            {/* Code Editor */}
            {(previewMode === 'editor' || previewMode === 'split') && (
              <div
                className="flex flex-col overflow-hidden"
                style={{
                  width: previewMode === 'split' ? '50%' : '100%',
                  borderRight: previewMode === 'split'
                    ? `1px solid ${isDark ? '#313244' : '#d0d0e0'}`
                    : 'none',
                }}
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
                      <span
                        className="text-xs"
                        style={{ color: isDark ? '#6c7086' : '#888899' }}
                      >
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
                style={{
                  width: previewMode === 'split' ? '50%' : '100%',
                }}
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
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-white/80">
            NexCode IDE
          </span>
          {activeFile && (
            <span className="text-xs text-white/70">
              {activeFile.name} · {activeFile.language.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/70">
            Font: {fontSize}px
          </span>
          <span className="text-xs text-white/70">
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </span>
          <span className="text-xs text-white/70">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>
    </div>
  );
}
