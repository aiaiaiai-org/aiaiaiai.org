# Sphere Focus — physical reference frame and camera contract

**Status:** Design contract for a future implementation; **not implemented**  
**Decision:** 23 November 2026  
**Scope:** Five-body Star Awakening scene on aiaiaiai.org  
**Related contract:** [STAR-AWAKENING.md](STAR-AWAKENING.md)

## 1. User interaction

After the initial star activation, tapping any of the four satellites selects that
sphere as the **visual frame of reference**. The camera eases toward a framing
in which the selected satellite occupies the center of the viewport. The central
star keeps spinning, and all bodies keep moving along the same trajectories
they would follow without a selection. Their apparent motion is now observed
relative to the selected sphere. Selecting another satellite changes the
observer, **not the physical center of attraction**.

This must never be implemented by reparenting the other meshes to the
selected sphere, teleporting their coordinates, or restarting their orbits.
The scene contains exactly five primary sphere meshes throughout.

The selection persists until the user chooses another sphere or selects a
"system view" control. Each sphere retains its stable stage identity, status,
color, and progress regardless of which sphere is centered.

## 2. Physical model (future scope)

The existing `pose(depth, time)` is an authored kinematic orbit, **not a
gravity simulation**. Do not label it gravitational or claim that radius,
mass, and weight currently affect movement.

A future N-body simulation should use world-space positions `rᵢ`,
velocities `vᵢ`, positive inertial masses `mᵢ`, and one global gravitational
constant `G`. Pairwise gravity should follow the softened inverse-square
law, with relative displacement `dᵢⱼ = rⱼ − rᵢ`:

`Fᵢⱼ = G mᵢ mⱼ dᵢⱼ / (|dᵢⱼ|² + ε²)^(3/2)`

Here `ε` is a declared numerical softening length, not a decorative
visual parameter. Set physical radii and densities consistently, e.g.
`mᵢ = 4πρᵢRᵢ³/3` for homogeneous spheres, or document deliberate
different densities. Rendered scale and physical mass must not be coupled
accidentally. "Weight" is the local gravitational force experienced by a
body; mass remains invariant under camera changes.

Use a fixed physics timestep (candidate: 1/120 simulation-second), a
symplectic or velocity-Verlet integrator, bounded catch-up after hidden tabs,
and a defined collision/contact policy. Initialize approximately stable
orbits around a dominant central mass, keeping total linear momentum near
zero. The five-body problem is not generally a collection of perfectly
circular, closed Keplerian orbits; allow the simulation to exhibit real
perturbations instead of forcing ideal circles.

Record numerical drift in energy, angular momentum, and barycenter over
bounded test runs. Choose `G`, masses, distances, time scale, softening and
collision response only after an engineering prototype with measured
stability. No pseudo-physical marketing claim is permitted before then.

## 3. The observer is not a force

Store the chosen focus as a stable `SatelliteId | 'system'`. The physics
system stays in one inertial world coordinate space. On every render frame:

1. Read the selected sphere's **current world position** from the physics
   snapshot, without modifying the snapshot.
2. Derive the camera's look-at target from that position (or the system
   barycenter for system view).
3. Integrate the camera target/orientation with a damped second-order
   spring, using a bounded timestep. Preserve a consistent "up" direction,
   smooth handover between targets, and a user-adjustable orbital view.
4. Recompute apparent positions only through the unchanged view/projection
   matrix. The selected sphere remains centered while the central star and
   other satellites show their **relative** trajectories.
5. Allow the selected sphere to remain visible at a comfortable scale:
   camera distance and field of view must not collide with its geometry or
   crop it under iOS safe areas.

Camera spring energy is **not** physical energy of a sphere. It must not
modify velocities, masses, gravitational forces, or the simulation clock.
If the selected sphere passes behind another body, correct occlusion and
lighting must still hold. A camera recentering must not fabricate an
orbit around the selected body.

Avoid an artificial lock that makes all other bodies appear to revolve
around the selected sphere in perfect circles. In a co-moving frame they
follow the differences `rⱼ(t) − r_selected(t)`, which may be complex.

## 4. Hit testing and accessibility

- The large star remains the initial activation target.
- After activation, use actual 3D raycasting against the four named satellite
  meshes for pointer/touch selection. Respect canvas bounds, DPR and camera.
- Permit ordinary taps; do not require pressure or long press.
- Interacting with the 3D scene must not accidentally select the page's
  header or safe-area text in mobile Safari. Scope touch callout/selection
  handling to the 3D interaction region rather than every document element.
- Provide equivalent semantic, focusable controls for keyboard and assistive
  technology. These identify each sphere and its current runtime stage.
- Provide an explicit, accessible `System view` action and predictable
  focus handling after camera transitions.
- Respect reduced-motion preferences: recenter instantly or via a much
  shorter non-oscillating camera move, without inventing a different orbit.
- Do not let raycasting, selection, or camera controls block native scrolling
  elsewhere on the page.

## 5. Separation of concerns

```text
Runtime stage source  → stage status/tint/label (no camera authority)
N-body engine         → masses, trajectories, collisions (no UI authority)
Selection controller  → chosen stable sphere ID (no forces)
Camera follower       → view matrix and spring state (no world mutation)
Three.js renderer     → five meshes, materials, lighting, occlusion
```

The same stable sphere identity must be reused by stage state, scene object,
hit test, keyboard control and camera selection. No product-specific identity
or cross-service token belongs in the physical scene.

## 6. Acceptance tests before implementation is considered complete

1. Switching focus does not change any body's position/velocity at the same
   simulation timestamp, within the same fixed-step state.
2. The selected satellite is near the viewport center at rest on portrait
   and landscape mobile; no clipping into Safari safe areas.
3. The central star and other satellites continue to move according to the
   same world-space trajectories under every selected view.
4. A rapid sequence of taps cannot launch competing camera springs or leave
   stale selections; the most recent valid selection wins.
5. Correct 3D occlusion, real depth, per-sphere stage status and coloring
   survive camera changes.
6. Numerical invariants and frame budget are measured under bounded steps,
   low refresh rates, tab suspend/resume, and device recovery.
7. Screen readers and keyboard can select all four stages and restore system
   view. Mobile long-press does not highlight unrelated DOM text.
8. No release is claimed until real-device and Full CI/Validate checks pass.

## 7. Delivery boundary

Implement this in a **separate future feature branch/PR**, after stage-state
integration and any conflicting mobile interaction work are reconciled.
Do not treat this document as evidence that N-body gravity or camera focus
already exists. No merge, runtime deployment or public release is authorized
by this design alone.

---

© 2026 aiaiaiai · aiaiaiai.org
