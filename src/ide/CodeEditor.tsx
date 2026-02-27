import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { useEffect, useRef } from 'react';
import type { FileLanguage } from './types.ts';

interface CodeEditorProps {
  content: string;
  language: FileLanguage;
  theme: 'dark' | 'light';
  fontSize: number;
  onChange: (value: string) => void;
}

function getLanguageExtension(language: FileLanguage) {
  switch (language) {
    case 'html':
      return html({ autoCloseTags: true });
    case 'css':
      return css();
    case 'javascript':
    case 'plaintext':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'jsx':
      return javascript({ jsx: true });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'json':
      return json();
    case 'markdown':
      return markdown();
    default:
      return javascript();
  }
}

export default function CodeEditor({
  content,
  language,
  theme,
  fontSize,
  onChange,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: `${fontSize}px`,
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '8px 0',
        },
      }),
      ...(theme === 'dark'
        ? [oneDark]
        : [syntaxHighlighting(defaultHighlightStyle, { fallback: true })]),
    ];

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, theme, fontSize]);

  // Sync external content changes (e.g. file switch)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: content },
      });
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="h-full w-full"
      style={{
        background: theme === 'dark' ? '#282c34' : '#ffffff',
      }}
    />
  );
}
