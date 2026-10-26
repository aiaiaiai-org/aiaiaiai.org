// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0

export const satelliteIds = ['amber', 'blue', 'green', 'violet'] as const;
export type SatelliteId = (typeof satelliteIds)[number];
export type MotionPhase = 'idle' | 'pressing' | 'transitioning' | 'settled';

/** Visual state only: it cannot claim that a model is loading or ready. */
export class Motion {
  phase: MotionPhase = 'idle';
  depth = 0;
  compression = 0;
  private velocity = 0;
  private compressionVelocity = 0;
  private pressure = 0;
  private held = 0;
  private activated = false;

  press(pressure = 0) {
    if (this.activated || this.phase === 'pressing') return false;
    this.phase = 'pressing';
    this.held = 0;
    this.pressure = Math.max(0, Math.min(1, pressure));
    return true;
  }

  cancel() {
    if (this.phase === 'pressing') this.phase = 'idle';
  }

  activate() {
    if (this.activated) return false;
    this.activated = true;
    this.phase = 'transitioning';
    return true;
  }

  step(elapsed: number, reduced = false) {
    // Bound resumed/background frames, then substep for refresh-rate stability.
    let remaining = Math.min(0.05, Math.max(0, elapsed));
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 240);
      remaining -= dt;
      if (this.phase === 'pressing') this.held += dt;
      const target = this.activated ? 1 : 0;
      if (reduced) {
        this.depth = target;
        this.velocity = 0;
        this.compression = 0;
        this.compressionVelocity = 0;
      } else {
        this.velocity += ((target - this.depth) * 90 - this.velocity * 14) * dt;
        this.depth += this.velocity * dt;
        const press =
          this.phase === 'pressing'
            ? 0.55 + Math.min(this.held, 0.5) * 0.5 + this.pressure * 0.2
            : 0;
        this.compressionVelocity +=
          ((press - this.compression) * 180 - this.compressionVelocity * 22) *
          dt;
        this.compression += this.compressionVelocity * dt;
      }
    }
    if (
      this.activated &&
      Math.abs(this.depth - 1) < 0.001 &&
      Math.abs(this.velocity) < 0.001
    ) {
      this.depth = 1;
      this.velocity = 0;
      this.phase = 'settled';
    }
  }

  get moving() {
    return (
      this.phase === 'pressing' ||
      this.phase === 'transitioning' ||
      Math.abs(this.compression) > 0.001 ||
      Math.abs(this.compressionVelocity) > 0.001
    );
  }
}

export function pose(depth: number, time: number) {
  return {
    starZ: 0.65 - depth * 1.45,
    satellites: satelliteIds.map((id, index) => {
      const angle = (index * Math.PI) / 2 + 0.45 + time * 0.055;
      return {
        id,
        x: Math.cos(angle) * 1.38,
        y: Math.sin(angle) * 1.08,
        z: -0.6 + depth * 1.5 + Math.sin(angle) * 0.12,
      };
    }),
  };
}
