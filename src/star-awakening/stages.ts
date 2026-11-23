// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0

import type { SatelliteId } from './motion';

// Runtime state is separate from visual motion. Nothing advances on a timer.
export const stageDefinitions = [
  { id: 'downloading', satellite: 'blue', color: '#648de4' },
  { id: 'initializing', satellite: 'green', color: '#60ae86' },
  { id: 'awakening', satellite: 'violet', color: '#a080d2' },
  { id: 'study', satellite: 'amber', color: '#dda254' },
] as const satisfies readonly {
  id: string;
  satellite: SatelliteId;
  color: string;
}[];

export type StageId = (typeof stageDefinitions)[number]['id'];
export type StageStatus = 'pending' | 'active' | 'complete' | 'failed';
export type StageSnapshot = {
  id: StageId;
  satellite: SatelliteId;
  status: StageStatus;
  loadedBytes?: number;
  totalBytes?: number;
  error?: string;
};

export type StageEvent =
  | { type: 'start'; stage: StageId }
  | {
      type: 'progress';
      stage: 'downloading';
      loadedBytes: number;
      totalBytes?: number;
    }
  | { type: 'complete'; stage: StageId }
  | { type: 'fail'; stage: StageId; error: string };

// The future model/provider adapter owns downloads, consent and actual inference.
// Its events must be evidence from runtime operations, never scene animation.
export interface RuntimeStageSource {
  subscribe(listener: (event: StageEvent) => void): () => void;
  start(): Promise<void>;
}

export class StageTimeline {
  private states: Record<StageId, StageSnapshot> = Object.fromEntries(
    stageDefinitions.map((stage) => [
      stage.id,
      { id: stage.id, satellite: stage.satellite, status: 'pending' },
    ]),
  ) as Record<StageId, StageSnapshot>;

  snapshots(): StageSnapshot[] {
    return stageDefinitions.map(({ id }) => ({ ...this.states[id] }));
  }

  apply(event: StageEvent): boolean {
    const current = this.states[event.stage];
    if (event.type === 'start') {
      const index = stageDefinitions.findIndex(({ id }) => id === event.stage);
      // Study alone can restart for a subsequent inference request.
      if (
        (current.status !== 'pending' &&
          !(event.stage === 'study' && current.status === 'complete')) ||
        stageDefinitions
          .slice(0, index)
          .some(({ id }) => this.states[id].status !== 'complete')
      )
        return false;
      this.states[event.stage] = {
        id: event.stage,
        satellite: current.satellite,
        status: 'active',
      };
      return true;
    }

    if (current.status !== 'active') return false;

    if (event.type === 'progress') {
      const previous = current.loadedBytes ?? 0;
      const { loadedBytes, totalBytes } = event;
      if (
        !Number.isSafeInteger(loadedBytes) ||
        loadedBytes < previous ||
        (totalBytes !== undefined &&
          (!Number.isSafeInteger(totalBytes) ||
            totalBytes <= 0 ||
            totalBytes < loadedBytes))
      )
        return false;
      this.states.downloading = {
        ...current,
        loadedBytes,
        ...(totalBytes === undefined ? {} : { totalBytes }),
      };
      return true;
    }

    if (event.type === 'fail') {
      this.states[event.stage] = {
        ...current,
        status: 'failed',
        error: event.error || 'Unknown runtime failure',
      };
      return true;
    }

    this.states[event.stage] = { ...current, status: 'complete' };
    return true;
  }
}

export const pulseFrames = [' ___', ' __', ' _', ''] as const;
