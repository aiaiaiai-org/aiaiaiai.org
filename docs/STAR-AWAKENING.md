# Star Awakening — 3D Interaction and Runtime Contract

**Status:** Approved design direction; **not implemented, released, or approved for deployment**  
**Decision date:** 26 October 2026  
**Scope:** `aiaiaiai.org` interactive entry experience  
**Parent contract:** [CONCEPT.md](CONCEPT.md)  
**Repository:** https://github.com/aiaiaiai-org/aiaiaiai.org

## 1. Intent and precedence

> aiaiaiai.org does not simply open; it awakens.

The user touches a central **star**. The interaction causes a perceptible, physically coherent change in an actual 3D composition: the central star yields and travels backwards, while its four satellites move forwards. The satellites then visualize **real system stages** for a future in-browser language model (WebLLM or equivalent). Completed stages acquire persistent colors from the aiaiaiai visual identity.

This document records the decisions from the 26 October 2026 design discussion and provides a handoff contract for engineers and other AI agents.

**Design requirements** here supersede the previous *pure-white initial-interface direction* in [CONCEPT.md](CONCEPT.md) **for the eventual Star Awakening experience**. They do **not** authorize shipping an unfinished animated loader, changing the production website immediately, selecting a particular language model, or deploying without approval. The white baseline may remain in production until a complete functional experience passes release gates.

Interpretation:
- **MUST** / **MUST NOT**: agreed behavior or project boundary.
- **SHOULD**: recommended implementation behavior, alterable with an explicit rationale.
- **OPEN**: decision not yet made; do not invent an answer and present it as settled.

## 2. Reference interpretation

Two visual references were supplied during the design conversation:
1. A white, nearly monochrome orbital composition: a large central sphere, smaller satellites, understated orbital outlines, and a tactile, softly lit surface. The picture is **visual inspiration**, not an exact layout or approved existing UI.
2. Four translucent, materially colored `ai` marks: **orange/amber, blue, green, violet**. They define the four satellite color identities. The original illustration does not require the scene to reproduce the letterforms.

The composition and interaction described in this document, **not the pixels of the reference images**, are the source of truth. The source images are conversation references and are not yet committed as repository assets.

## 3. Visual world

### 3.1 Background

- Replace visually flat pure white **for this experience** with a nearly white **soft-plastic / porcelain-like** environment.
- It should feel subtly textured and tangible rather than look like paper, noisy plaster, a glossy mirror, or colored fog.
- `#F7F7F5` or `#F6F6F3` are **candidate** base colors, not a finalized design token.
- Use restrained warm/cool tonal variations, soft shadowing and restrained ambient lighting. Do not introduce decorative copy, unrelated objects, or an obvious repeating texture.
- Aim for an immersive scene without sacrificing contrast or accessibility.

### 3.2 Five spheres — invariant

The primary composition MUST contain **exactly five principal spheres**:
- **1 larger central star**: the user's entry target and visual anchor.
- **4 smaller satellites** arranged around it in 3D, initially visually subordinate or behind the star.

Orbital guidelines, light halos and shadows are supporting rendering features, **not additional sphere objects**. Satellites should have persistent identities even as they move, change state or temporarily become occluded.

### 3.3 Materials

- The base look is **soft polymer / ceramic / translucent plastic**, not flat CSS circles, hard chrome or jelly.
- Apply believable, coordinated specular response, depth cues, light gradients, contact softness and occlusion.
- Colors should look like they exist *within the object's material* (tinted volume / reflected or internal light), not an abrupt 2D overlay.
- Avoid excessive bloom, saturated glow, thick glass distortion or distracting particle effects.
- On mobile, scale the scene to the viewport without clipping the interactive target or requiring horizontal scroll.

## 4. Interaction — true 3D spatial transfer

A tap/click on the central star MUST initiate a **geometric 3D reordering**, not a CSS-only imitation of front/back layers.

### 4.1 Idle

- Large, almost-white star occupies the foreground and remains the focal point.
- Four satellites follow subtle orbital or breathing motion behind or around it.
- `touch to begin` is visible as a minimal initiation cue (final placement and typography remain design details).
- No language-model assets are downloaded before an explicit user activation.
- Motion is quiet and intentionally restrained.

### 4.2 Contact / press

- On pointer down, the center yields as if it has elastic resistance: a small compression/displacement, subtle deformation or equivalent material/light response.
- Spring-like stiffness and damping communicate weight and accumulated energy.
- The cue `touch to begin` begins to fade **smoothly**; it does not disappear abruptly.
- If input is cancelled, the scene returns coherently to idle without starting the model.
- Hardware pressure may enhance the effect **only where trustworthy and supported**. Ordinary click/tap MUST work without pressure sensing; hold duration or an authored spring curve is an acceptable fallback.

### 4.3 Release / spatial transfer

- On successful activation, the central star **moves backwards on the Z axis** and ceases to dominate the front layer.
- All four satellites **travel forwards in 3D** while keeping identifiable orbital relationships.
- Occlusion changes for real: satellites can pass in front of, partially obscure and receive believable light in relation to the recessed star.
- A restrained camera/lighting response MAY reinforce the transfer; it MUST NOT replace actual object movement or create an abrupt scene cut.
- Movement has inertia, damping and a restrained overshoot/settling response. No teleporting, sudden depth-order flips, or artificial 2D z-index swaps.
- The transition and underlying initialization can overlap, but visual readiness MUST be driven by genuine state.
- Successful activation is **idempotent**: repeated tapping does not create parallel model downloads or overlapping transitions.

### 4.4 Active phase

- The four foreground satellites orbit the recessed central star, with stable identities and modest motion.
- Each satellite corresponds to a real initialization/runtime stage.
- While a stage is active, a **faint, slow pulse of its assigned color appears behind that satellite**.
- When the stage actually completes, that satellite **gradually takes on its assigned `ai` color**. The color remains visible while the overall scene continues.
- The orbit MUST remain intelligible: users should be able to distinguish what is active, complete, pending, and failed without relying on motion or color alone.
- The scene reaches `ready` only when the actual runtime reports readiness. What happens next remains OPEN.

## 5. Satellite identity and color behavior

| Stable satellite | Color identity | Candidate tone | Status |
| --- | --- | --- | --- |
| Satellite 1 | Amber/orange | warm translucent amber | Color family agreed; exact value OPEN |
| Satellite 2 | Blue | deep luminous blue | Color family agreed; exact value OPEN |
| Satellite 3 | Green | saturated translucent green | Color family agreed; exact value OPEN |
| Satellite 4 | Violet | rich translucent purple | Color family agreed; exact value OPEN |

**Important:** Association of a *specific technical stage* with each color is **provisional** until the model/runtime contract is chosen. Assign stable `satelliteId` and `colorId` now; map runtime stages separately so the scene does not hard-code provider behavior.

Recommended rendering states for every satellite:

| Stage status | Visual behavior |
| --- | --- |
| `pending` | Nearly white, subdued material, low activity |
| `active` | Slight colored back-glow pulsing behind the sphere; readable progress if known |
| `complete` | Gradual material tint into the assigned color, remains colored |
| `failed` | Motion settles; accessible error indication and recovery action, never false completion |

The color pulse must be subtle during work; the material-color transformation is the meaningful success signal. Avoid assigning arbitrary fake completion percentages.

## 6. Runtime contract: rendering is not the loader

**OPEN:** exact WebLLM library, model, model size, supported hardware, worker arrangement, cache strategy, deployment target and the post-ready interaction.

Proposed semantic phases (**not yet binding provider-specific steps**):
1. `environment` — capability/runtime availability, including 3D and compute support.
2. `assets` — real model/resource fetching and, when relevant, network connection.
3. `initialize` — actual runtime, worker, GPU/WASM and model initialization.
4. `optimize` — genuine warmup/preparation until usable.

The UI MUST subscribe to actual events and measured outcomes; it MUST NOT display simulated progress as real status. Some runtime work may overlap or have fewer/more events than four phases; a dedicated adapter should normalize raw events into four **meaningful** satellite responsibilities, document the mapping, and avoid claims unsupported by the chosen runtime. The phase model can be revised when the provider is selected, preserving four visible spheres.

Suggested UI-facing types (illustrative, not an approved public API):

```ts
type SatelliteId = "amber" | "blue" | "green" | "violet";
type StageStatus = "pending" | "active" | "complete" | "failed";
type ScenePhase =
  | "idle"
  | "pressing"
  | "transitioning"
  | "loading"
  | "ready"
  | "error";

type StageSnapshot = {
  id: SatelliteId;
  status: StageStatus;
  progress?: number; // Only if supported by real measured progress; 0..1.
  label: string;      // Human-readable, accessible status.
  error?: string;     // Safe, actionable detail when a stage fails.
};
```

Keep **scene state** (visual poses, animation progress, depth) distinct from **runtime state** (network, model assets, initialization, errors). The loader signals readiness; the animation never invents it.

If the runtime requires large downloads, the product should disclose their approximate size and obtain any necessary user confirmation **before starting a costly transfer**. Gesture-based activation is required; do not fetch a large model merely because the page opened.

## 7. Rendering and implementation boundaries

**Architecture direction (provisional, consistent with previous stack discussion):**
- **Astro + TypeScript** as the lightweight document/application shell.
- **Real Three.js 3D scene** for geometry, depth, light, camera, orbit and material behavior. React Three Fiber is an option if justified by component complexity; avoid making React a site-wide requirement without a reason.
- A spring-based motion controller can deliver convincing physical response without immediately installing a rigid-body engine.
- WebGL is an acceptable starting rendering backend. WebGPU is a **candidate future renderer**, not a prerequisite for truthful 3D depth. Decide after capability/performance testing.
- The eventual browser model runtime must be **decoupled** from the scene through a small observable adapter. Do not mix model loading side effects into frame callbacks.
- Backend services (e.g. Rust/Axum) are **not** required for the initial 3D interaction and must not be fabricated as dependencies.

Suggested modules (names are proposals):

```text
src/
  components/star-awakening/
    scene/           # camera, lights, star, satellites, material, orbit
    interaction/     # pointer/key input and spring-driven spatial transfer
    state/           # finite-state machine + visual poses
    runtime/         # typed loader adapter and real progress snapshots
    accessibility/   # text equivalents, focus and motion preferences
```

This is an organizational suggestion, not a command to create the entire tree in the documentation PR.

## 8. Input, accessibility, failure, performance

- `pointerdown`, `pointerup`, `pointercancel` and keyboard Enter/Space should give consistent semantics. A normal tap/click **must** activate without long-press or pressure support.
- The star is a semantic, focusable action target with an accessible name. Real progress and errors have non-visual status equivalents.
- Respect `prefers-reduced-motion`: replace complex travel/orbits with a shorter, stable spatial transition while retaining clear functional status.
- If 3D rendering or model compute is unsupported, present an **honest accessible fallback** and recovery guidance; never leave an eternal, falsely spinning loader.
- Ensure bounded frame work, responsive resizing, sane device-pixel-ratio limits and cleanup of renderer resources on unmount/navigation.
- On `error`, stop deceptive success animations, preserve diagnostic detail for troubleshooting, and expose a retry path if retry is safe.
- Do not assume every device supports WebGPU, pressure, large GPU model memory, or reliable network.
- Validate the experience on desktop, touch devices, slow networks and constrained mobile hardware. Do not claim performance metrics before measurement.

## 9. Explicit non-goals and unresolved decisions

Not in scope for this design-contract PR:
- Selecting or bundling a specific WebLLM model.
- Implementing 3D, WebGPU, shaders, model downloads, or a production deployment.
- Adding conventional marketing sections, a product directory or unfinished portals.
- Imposing product-specific semantics from 0x1, Prism, mind or other independent projects.
- Choosing final camera coordinates, spring constants, object radii, duration timings, noise maps, typography placements or shader implementations without prototypes and testing.

Open decisions for follow-up:
- Exact model/provider, maximum resource footprint and user consent/size disclosure.
- True device support matrix, WebGL/WebGPU strategy and accessible fallback design.
- The four actual stage-to-satellite mappings and whether stages may finish out of order.
- The visual treatment after all four spheres are complete.
- The initial public release plan: keep White Canvas until the interaction is complete, or make the **fully functional** Star Awakening the first released experience. Neither is authorized for production here.

## 10. Handoff and incremental PR plan

1. **Documentation (this PR):** preserve the decisions and resolve the apparent conflict with White Canvas. No runtime changes.
2. **Scene foundation:** actual camera, materials, lighting, a large star, four satellites, correct depth and responsive composition. Development/preview only; no pretend public interactions.
3. **Physical input and transition:** contact/compression/release, spring Z-transfer, occlusion, orbital motion, pointer/keyboard and reduced-motion behavior. Test the real geometry changes, not only opacity.
4. **Stage display contract:** typed event adapter and four satellite state behaviors, with deterministic **test fixtures confined to tests/previews**. Production must not fake completion.
5. **Real model integration:** select the model and hardware policy, connect genuine download/init/warmup lifecycle, errors, accessibility and resource disclosures.
6. **Release hardening:** desktop/mobile visual testing, functional and performance checks, build/Full CI, deploy Validate, explicit approval for merge, and **separate explicit approval for deploy**.

PRs should be small, independently reviewable, and start from the current default branch after prerequisite PRs are merged. No direct commits to `master`. The website's stable-only release rule remains binding.

## 11. Acceptance criteria for the complete experience

- A real 3D world renders a larger central star and exactly four identifiable orbiting satellites on a soft-white tactile background.
- Pressing the star produces physical-looking resistance, and activation makes the star **actually recede in 3D** while satellites **actually move in front** with correct occlusion.
- `touch to begin` dissolves smoothly, not by abrupt removal.
- Satellites orbit at a restrained pace; stage-specific ambient glow appears behind the active sphere.
- Each satellite becomes materially amber, blue, green or violet **only when its real stage succeeds**.
- No model starts downloading on page load; unsupported hardware and runtime failure have explicit, usable outcomes.
- Tap, click, keyboard, cancellation and reduced-motion preferences work.
- The implementation stays within the site's stable-only release and product-boundary contracts.
- Release and deploy are **separate explicit decisions** after verification.

---

© 2026 aiaiaiai · aiaiaiai.org
