import { FILE_ICONS, type FileTab } from './types.ts';

interface TabBarProps {
  files: Array<FileTab>;
  activeFileId: string;
  theme: 'dark' | 'light';
  previewMode: 'split' | 'editor' | 'preview';
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
  onPreviewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
}

const MODE_ICONS: Record<'editor' | 'split' | 'preview', string> = {
  editor: '✎',
  split: '⊞',
  preview: '▶',
};

const MODE_LABELS: Record<'editor' | 'split' | 'preview', string> = {
  editor: '⬜ Editor',
  split: '⬛ Split',
  preview: '⬜ Preview',
};

export default function TabBar({
  files,
  activeFileId,
  theme,
  previewMode,
  onSelectFile,
  onCloseFile,
  onPreviewModeChange,
}: TabBarProps) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#181825' : '#e8eaf6';
  const tabBg = isDark ? '#1e1e2e' : '#f0f0f8';
  const activeTabBg = isDark ? '#282c34' : '#ffffff';
  const border = isDark ? '#313244' : '#d0d0e0';
  const mutedText = isDark ? '#6c7086' : '#888899';
  const activeText = isDark ? '#cdd6f4' : '#2d2d3a';

  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        height: '40px',
        minHeight: '40px',
      }}
    >
      {/* Tabs */}
      <div className="flex h-full flex-1 items-end overflow-x-auto">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const icon = FILE_ICONS[file.language] ?? '📄';

          return (
            <div
              key={file.id}
              className="group flex h-full cursor-pointer items-center gap-1.5 px-3 text-xs transition-colors"
              style={{
                background: isActive ? activeTabBg : tabBg,
                color: isActive ? activeText : mutedText,
                borderRight: `1px solid ${border}`,
                borderTop: isActive ? '2px solid #667eea' : '2px solid transparent',
                minWidth: 'clamp(60px, 10vw, 80px)',
                maxWidth: '160px',
              }}
              onClick={() => onSelectFile(file.id)}
            >
              <span className="flex-shrink-0 text-xs">{icon}</span>
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              {file.isModified && <span className="flex-shrink-0 text-yellow-400">●</span>}
              <button
                className="flex-shrink-0 opacity-60 hover:!opacity-100 md:opacity-0 md:group-hover:opacity-60"
                style={{ color: '#f38ba8', lineHeight: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseFile(file.id);
                }}
                title="Close tab"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* View mode toggle */}
      <div
        className="flex flex-shrink-0 items-center gap-1 px-2"
        style={{ borderLeft: `1px solid ${border}` }}
      >
        {(['editor', 'split', 'preview'] as const).map((mode) => {
          const isActive = previewMode === mode;
          return (
            <button
              key={mode}
              className="rounded px-2 py-0.5 text-xs transition-all"
              style={{
                background: isActive ? '#667eea22' : 'transparent',
                color: isActive ? '#667eea' : mutedText,
                fontWeight: isActive ? 600 : 400,
              }}
              onClick={() => onPreviewModeChange(mode)}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              <span className="md:hidden">{MODE_ICONS[mode]}</span>
              <span className="hidden md:inline">{MODE_LABELS[mode]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
