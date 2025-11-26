import React, { useRef, useEffect } from 'react';
import { useCommandLineStore } from '../store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import { useCommandLine } from '../hooks/useCommandLine';

export const CommandLine: React.FC = () => {
  const isOpen = useCommandLineStore(state => state.isOpen);
  const input = useCommandLineStore(state => state.input);
  const setInput = useCommandLineStore(state => state.setInput);
  const currentMode = useAppModeStore(state => state.currentMode);

  const inputRef = useRef<HTMLInputElement>(null!);

  useCommandLine(inputRef);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const prefix = currentMode === 'search' ? '/' : ':';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 py-2 bg-gray-900/80 backdrop-blur-md border-t border-gray-700">
      {/* Prefix */}
      <span className="text-white font-mono text-base mr-2">{prefix}</span>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="flex-1 bg-transparent text-white font-mono text-base outline-none placeholder-gray-500"
        placeholder={currentMode === 'search' ? 'Search...' : 'Enter command...'}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
};
