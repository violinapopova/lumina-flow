import type { StateCreator } from 'zustand';
import type { AppState, JournalSlice } from '@store/types';

export const createJournalSlice: StateCreator<
  AppState,
  [],
  [],
  JournalSlice
> = (set) => ({
  journalEntries: [],
  addJournalEntry: (entry) =>
    set((s) => ({ journalEntries: [entry, ...s.journalEntries] })),
  updateJournalEntry: (id, partial) =>
    set((s) => ({
      journalEntries: s.journalEntries.map((entries) =>
        entries.id === id ? { ...entries, ...partial, updatedAt: new Date().toISOString() } : entries
      ),
    })),
  removeJournalEntry: (id) =>
    set((s) => ({ journalEntries: s.journalEntries.filter((e) => e.id !== id) })),
});
