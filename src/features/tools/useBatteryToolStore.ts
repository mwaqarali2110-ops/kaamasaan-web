'use client';

import { create } from 'zustand';
import type { Appliance } from '@/types/system.types';

/**
 * Carries the appliance selection between the three Battery Size Tool screens.
 *
 * Mobile passes `selectedAppliances` (a full array), `totalBackupWatts` and
 * `backupHours` as React Navigation route params across
 * BatterySizeTool -> BatteryRunningLoad -> BatteryRecommendedSize. A URL
 * cannot reasonably carry an appliance array, so this holds the same three
 * values in memory instead — deliberately **not** part of `useSystemStore`,
 * matching mobile's isolation of this standalone tool from the design draft.
 *
 * Not persisted: if a browser tab is closed mid-flow the customer restarts
 * from the tool's first screen, same as mobile losing unmounted route params.
 * A direct link to a later step with nothing selected falls back to `/tools/battery-size`.
 */
type BatteryToolState = {
  selectedAppliances: Appliance[];
  totalBackupWatts: number;
  backupHours: number;
  setRunningLoad: (input: { selectedAppliances: Appliance[]; totalBackupWatts: number }) => void;
};

export const useBatteryToolStore = create<BatteryToolState>((set) => ({
  selectedAppliances: [],
  totalBackupWatts: 0,
  // Mobile always calls BatterySizeToolScreen's navigate with a hardcoded
  // backupHours of 1, regardless of the per-appliance hours entered — the
  // computed "average backup hours" is dead code there. Reproduced as-is.
  backupHours: 1,
  setRunningLoad: ({ selectedAppliances, totalBackupWatts }) =>
    set({ selectedAppliances, totalBackupWatts, backupHours: 1 })
}));
