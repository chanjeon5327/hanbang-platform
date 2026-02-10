'use client';

import { create } from 'zustand';

export type PreviewState = {
  openId: string | null;
  openData: any | null;
  open: (id: string, data: any) => void;
  close: () => void;
};

export const useInterestPreview = create<PreviewState>((set) => ({
  openId: null,
  openData: null,
  open: (id, data) => set({ openId: id, openData: data }),
  close: () => set({ openId: null, openData: null }),
}));
