import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CommandLineState {
  isOpen: boolean;
  input: string;

  open: () => void;
  close: () => void;
  setInput: (input: string) => void;
  reset: () => void;
}

export const useCommandLineStore = create<CommandLineState>()(
  devtools(
    set => ({
      isOpen: false,
      input: '',

      open: () => {
        set({
          isOpen: true,
          input: '',
        });
      },

      close: () => {
        set({
          isOpen: false,
        });
      },

      setInput: input => {
        set({ input });
      },

      reset: () =>
        set({
          isOpen: false,
          input: '',
        }),
    }),
    { name: 'CommandLineStore' }
  )
);
