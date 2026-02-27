import { useRef, useState } from 'react';
import { FILE_ICONS, type FileTab, getLanguageFromFilename } from './types.ts';

interface SidebarProps {
  files: Array<FileTab>;
  activeFileId: string;
  theme: 'dark' | 'light';
  fontSize: number;
  onSelectFile: (id: string) => void;
  onAddFile: (name: string) => void;
  onRemoveFile: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onUploadFile: (name: string, content: string) => void;
  onThemeToggle: () => void;
  onFontSizeChange: (size: number) => void;
}

export default function Sidebar({
  files,
  activeFileId,
  theme,
  fontSize,
  onSelectFile,
  onAddFile,
  onRemoveFile,
  onRenameFile,
  onUploadFile,
  onThemeToggle,
  onFontSizeChange,
}: SidebarProps) {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';
  const bg = isDark ? '#1e1e2e' : '#f0f0f5';
  const border = isDark ? '#313244' : '#d0d0e0';
  const text = isDark ? '#cdd6f4' : '#2d2d3a';
  const subtext = isDark ? '#6c7086' : '#888899';
  const activeBg = isDark ? '#313244' : '#dde1f5';
  const hoverBg = isDark ? '#292942' : '#e8eaf6';

  const handleAddFile = () => {
    if (newFileName.trim()) {
      onAddFile(newFileName.trim());
      setNewFileName('');
      setIsAddingFile(false);
    }
  };

  const handleRename = (id: string) => {
    if (renameValue.trim()) {
      onRenameFile(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        onUploadFile(file.name, content);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        width: '220px',
        minWidth: '220px',
        background: bg,
        borderRight: `1px solid ${border}`,
        color: text,
      }}
    >
      {/* Logo / Brand */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}
        >
          {'</>'}
        </div>
        <span className="text-sm font-semibold" style={{ color: text }}>
          NexCode IDE
        </span>
      </div>

      {/* Files section */}
      <div className="flex-1 overflow-y-auto">
        {/* Section header */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ color: subtext }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest">
            Files
          </span>
          <div className="flex gap-1">
            <button
              title="Upload file"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-5 w-5 items-center justify-center rounded text-xs transition-colors hover:opacity-80"
              style={{ color: subtext }}
            >
              ↑
            </button>
            <button
              title="New file"
              onClick={() => setIsAddingFile(true)}
              className="flex h-5 w-5 items-center justify-center rounded text-lg transition-colors hover:opacity-80"
              style={{ color: subtext }}
            >
              +
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".html,.htm,.css,.js,.mjs,.ts,.jsx,.tsx,.json,.md,.txt"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Add file input */}
        {isAddingFile && (
          <div className="px-3 pb-2">
            <input
              autoFocus
              type="text"
              placeholder="filename.html"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFile();
                if (e.key === 'Escape') {
                  setIsAddingFile(false);
                  setNewFileName('');
                }
              }}
              onBlur={() => {
                if (!newFileName.trim()) {
                  setIsAddingFile(false);
                }
              }}
              className="w-full rounded px-2 py-1 text-xs outline-none"
              style={{
                background: isDark ? '#313244' : '#fff',
                border: `1px solid #667eea`,
                color: text,
              }}
            />
          </div>
        )}

        {/* File list */}
        <ul className="pb-2">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const lang = file.language;
            const icon = FILE_ICONS[lang] ?? '📄';

            return (
              <li key={file.id}>
                {renamingId === file.id ? (
                  <div className="px-3 py-1">
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(file.id);
                        if (e.key === 'Escape') {
                          setRenamingId(null);
                          setRenameValue('');
                        }
                      }}
                      onBlur={() => handleRename(file.id)}
                      className="w-full rounded px-2 py-1 text-xs outline-none"
                      style={{
                        background: isDark ? '#313244' : '#fff',
                        border: `1px solid #667eea`,
                        color: text,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="group flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm"
                    style={{
                      background: isActive ? activeBg : 'transparent',
                      color: isActive ? '#89b4fa' : text,
                    }}
                    onClick={() => onSelectFile(file.id)}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex-shrink-0 text-xs">{icon}</span>
                      <span className="truncate text-xs">
                        {file.name}
                        {file.isModified && (
                          <span className="ml-1 text-yellow-400">●</span>
                        )}
                      </span>
                    </div>
                    <div
                      className="flex flex-shrink-0 gap-1 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Rename"
                        className="flex h-4 w-4 items-center justify-center rounded text-xs opacity-60 hover:opacity-100"
                        style={{ color: subtext }}
                        onClick={() => {
                          setRenamingId(file.id);
                          setRenameValue(file.name);
                        }}
                      >
                        ✏
                      </button>
                      {files.length > 1 && (
                        <button
                          title="Delete"
                          className="flex h-4 w-4 items-center justify-center rounded text-xs opacity-60 hover:opacity-100"
                          style={{ color: '#f38ba8' }}
                          onClick={() => onRemoveFile(file.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom settings */}
      <div
        className="space-y-2 p-3"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {/* Font size */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: subtext }}>
            Font Size
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
              className="flex h-5 w-5 items-center justify-center rounded text-xs"
              style={{ background: isDark ? '#313244' : '#e0e0f0', color: text }}
            >
              -
            </button>
            <span className="w-6 text-center text-xs" style={{ color: text }}>
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
              className="flex h-5 w-5 items-center justify-center rounded text-xs"
              style={{ background: isDark ? '#313244' : '#e0e0f0', color: text }}
            >
              +
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: isDark ? '#313244' : '#dde1f5',
            color: text,
          }}
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
