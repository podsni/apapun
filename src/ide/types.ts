export type FileLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'markdown'
  | 'plaintext';

export interface FileTab {
  id: string;
  name: string;
  content: string;
  language: FileLanguage;
  isModified: boolean;
}

export interface IDEState {
  files: FileTab[];
  activeFileId: string | null;
  theme: 'dark' | 'light';
  fontSize: number;
  showPreview: boolean;
  previewMode: 'split' | 'editor' | 'preview';
}

export const FILE_ICONS: Record<FileLanguage, string> = {
  html: '🌐',
  css: '🎨',
  javascript: '⚡',
  typescript: '🔷',
  jsx: '⚛️',
  tsx: '⚛️',
  json: '📋',
  markdown: '📝',
  plaintext: '📄',
};

export const LANGUAGE_EXTENSIONS: Record<string, FileLanguage> = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext',
};

export function getLanguageFromFilename(filename: string): FileLanguage {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return LANGUAGE_EXTENSIONS[ext] ?? 'plaintext';
}
