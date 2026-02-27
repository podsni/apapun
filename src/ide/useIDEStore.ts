import { useCallback, useState } from 'react';
import { DEFAULT_FILES } from './defaultFiles.ts';
import {
  type FileLanguage,
  type FileTab,
  getLanguageFromFilename,
} from './types.ts';

let _nextId = 1000;
function nextId() {
  return `file-${_nextId++}`;
}

export function useIDEStore() {
  const [files, setFiles] = useState<Array<FileTab>>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content, isModified: true } : f)),
    );
  }, []);

  const addFile = useCallback((name: string) => {
    const language = getLanguageFromFilename(name);
    const newFile: FileTab = {
      id: nextId(),
      name,
      content: getDefaultContent(language),
      language,
      isModified: false,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const remaining = prev.filter((f) => f.id !== id);
        if (activeFileId === id && remaining.length > 0) {
          setActiveFileId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeFileId],
  );

  const renameFile = useCallback((id: string, newName: string) => {
    const language = getLanguageFromFilename(newName);
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName, language } : f)),
    );
  }, []);

  const saveFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isModified: false } : f)),
    );
  }, []);

  const uploadFile = useCallback((name: string, content: string) => {
    const language = getLanguageFromFilename(name);
    const existing = files.find((f) => f.name === name);
    if (existing) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === existing.id ? { ...f, content, language, isModified: false } : f,
        ),
      );
      setActiveFileId(existing.id);
    } else {
      const newFile: FileTab = {
        id: nextId(),
        name,
        content,
        language,
        isModified: false,
      };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
    }
  }, [files]);

  return {
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
    saveFile,
    uploadFile,
  };
}

function getDefaultContent(language: FileLanguage): string {
  switch (language) {
    case 'html':
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>New File</title>\n</head>\n<body>\n  \n</body>\n</html>';
    case 'css':
      return '/* New stylesheet */\n';
    case 'javascript':
      return '// JavaScript file\n';
    case 'typescript':
      return '// TypeScript file\n';
    case 'jsx':
      return '// React JSX component\nfunction App() {\n  return <div>Hello World</div>;\n}\n';
    case 'tsx':
      return '// React TSX component\nconst App: React.FC = () => {\n  return <div>Hello World</div>;\n};\n\nexport default App;\n';
    case 'json':
      return '{\n  \n}';
    case 'markdown':
      return '# New Document\n\nStart writing here...\n';
    default:
      return '';
  }
}
