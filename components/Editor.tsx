import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { EditorConfig, ViewOptions } from '../types';

interface EditorProps {
  config: EditorConfig;
  viewOptions: ViewOptions;
  onInput: (text: string) => void;
  readOnly?: boolean;
  initialContent?: string;
}

export interface EditorHandle {
  executeCommand: (command: string, value?: string) => void;
  appendText: (text: string) => void;
  setHTML: (html: string) => void;
  insertImage: (base64: string) => void;
  getHTML: () => string;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ config, viewOptions, onInput, readOnly = false, initialContent }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    executeCommand: (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
      }
    },
    appendText: (text: string) => {
        if(editorRef.current) {
            editorRef.current.innerText += text;
            onInput(editorRef.current.innerText);
        }
    },
    setHTML: (html: string) => {
        if(editorRef.current) {
            editorRef.current.innerHTML = html;
            // Only trigger input if not readonly to avoid loops if we were using this for sync
            if (!readOnly) onInput(editorRef.current.innerText);
        }
    },
    insertImage: (base64: string) => {
        if(editorRef.current) {
            // Standard execCommand for image insertion
            // In a production app we might want to create the img element manually for more control
            document.execCommand('insertImage', false, base64);
            onInput(editorRef.current.innerText);
        }
    },
    getHTML: () => {
      return editorRef.current ? editorRef.current.innerHTML : '';
    }
  }));

  // Initialize content for readOnly instances or initial loads
  useEffect(() => {
      if (initialContent && editorRef.current) {
          if (editorRef.current.innerHTML !== initialContent) {
              editorRef.current.innerHTML = initialContent;
          }
      }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current && !readOnly) {
      onInput(editorRef.current.innerText);
    }
  };

  // CSS Injection for Line Numbers
  const lineNumberStyles = `
    .show-line-numbers {
      counter-reset: line;
    }
    .show-line-numbers > p, 
    .show-line-numbers > div, 
    .show-line-numbers > h1, 
    .show-line-numbers > h2, 
    .show-line-numbers > h3,
    .show-line-numbers > h4 {
      position: relative;
      counter-increment: line;
    }
    .show-line-numbers > p::before, 
    .show-line-numbers > div::before,
    .show-line-numbers > h1::before, 
    .show-line-numbers > h2::before,
    .show-line-numbers > h3::before {
      content: counter(line);
      position: absolute;
      left: -3.5rem;
      top: 0;
      color: #9ca3af;
      font-size: 0.7em;
      font-family: monospace;
      width: 2.5rem;
      text-align: right;
      user-select: none;
    }
  `;

  return (
    <div 
        className={`flex-1 h-full overflow-y-auto flex justify-center cursor-text editor-container transition-colors duration-300
            ${viewOptions.isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}
        `}
        onClick={() => !readOnly && editorRef.current?.focus()}
    >
      <style>{lineNumberStyles}</style>
      <div 
        className={`
            my-8 page-shadow transition-all duration-300 ease-in-out editor-container relative flex flex-col
            ${viewOptions.isDarkMode ? 'bg-stone-800 text-stone-200' : 'bg-paper text-ink'}
            ${viewOptions.isTypewriterMode ? 'pb-[80vh]' : 'min-h-[calc(100%-4rem)]'}
        `}
        style={{
          width: config.maxWidth === '100%' ? 'calc(100% - 4rem)' : config.maxWidth,
          maxWidth: '100%',
          padding: '4rem 5rem', // Literary margins
          transform: `scale(${viewOptions.zoom / 100})`,
          transformOrigin: 'top center'
        }}
      >
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          className={`
            editor-content outline-none empty:before:text-stone-300
            ${!readOnly ? "empty:before:content-['Comece_sua_obra_prima...']" : ""}
            ${viewOptions.showLineNumbers ? 'show-line-numbers' : ''}
          `}
          spellCheck={false} // We use our own AI spell check
          style={{
            fontFamily: config.fontFamily,
            fontSize: `${config.fontSize}px`,
            lineHeight: config.lineHeight,
            textAlign: config.textAlign,
            color: 'inherit', // Inherit from parent (handles dark mode)
          }}
        >
           {/* Initial content can be placed here if needed */}
           {!initialContent && !readOnly && <p>O crepúsculo caía suavemente sobre a cidade de mármore, tingindo as estátuas antigas com tons de dourado e violeta...</p>}
        </div>

        {/* Page Number Simulation */}
        {viewOptions.showPageNumbers && (
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-stone-400 font-mono select-none">
                - 1 -
            </div>
        )}
      </div>
    </div>
  );
});

export default Editor;