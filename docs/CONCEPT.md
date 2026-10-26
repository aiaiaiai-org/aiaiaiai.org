# aiaiaiai.org — Website Concept and Agreed Decisions

**Status:** Star Awakening design agreed; implementation and first public release not yet approved  
**Decision dates:** 25 October 2026 (base principles); 26 October 2026 (Star Awakening)  
**Website:** https://aiaiaiai.org  
**Repository:** https://github.com/aiaiaiai-org/aiaiaiai.org

## 1. Purpose

aiaiaiai.org is an independent entry point into the **aiaiaiai** universe. It will **gain functionality incrementally through stable releases**. It is not a conventional corporate landing page, a roadmap presentation, or a product directory.

**Core principle:** The website presents only what has actually been completed, verified, and released. Missing functionality is not disguised with announcements or decorative placeholders.

## 2. Current Design Direction: Star Awakening

**The 26 October 2026 decision extends and changes the original interface direction.**
The target interaction is a tactile, soft-white **true 3D scene** with one large
central star and four orbiting spheres. Pressing the star compresses and sends
it backward in 3D as the satellites move to the foreground. The satellites
represent real initialization stages and gradually acquire four distinct colors
only when their work is complete.

**Canonical interaction and engineering contract:**
[STAR-AWAKENING.md](STAR-AWAKENING.md).

### White Canvas (earlier baseline)

The 25 October concept proposed a totally blank `#FFFFFF` launch page:
no visible text, logo, navigation, buttons, artwork, animations, demos or
“Coming soon”. This remains a **valid earlier baseline**, not a mandatory
end-state and not proof that a first release has occurred.

The new design replaces pure white with a nearly white soft-plastic material
treatment **when the complete Star Awakening experience is released**.
It does not authorize a half-implemented public 3D scene. A public release
may retain the safe blank baseline until its replacement is ready;
the first-release sequence and version remain undecided.

## 3. Visual Language

The agreed target for Star Awakening is **soft white / tactile plastic / porcelain**:
a lightly textured, almost white environment with physical depth, restrained
light and material-driven shading. The core composition consists of exactly
five principal spherical objects. Satellite material-color identities are
**amber/orange, blue, green and violet**.

- **Spatial truth:** The star and satellites physically exchange depth in a
  real 3D scene; flat opacity and CSS layer-order tricks are insufficient.
- **Physical feedback:** Contact, compression and release should feel
  spring-driven, with inertia and damping but without gratuitous motion.
- **Meaningful color:** Subtle back-glow during actual work; gradually tinted
  sphere material upon real stage completion.
- **No visual clutter:** Only functioning, complete experiences become public.
- **Compatibility:** Provide honest non-3D and model-runtime fallback behavior.

Glassmorphism and skeuomorphism are stylistic references, not licenses to
add decorative or nonfunctional elements.

Earlier visual references:
- https://share.google/0OurBOYtnP63bfQa0 — glassmorphism
- https://share.google/h8nngPyBFdxtMbgw1 — glassmorphism
- https://share.google/JjCwSJGNSIhqTXhwu — skeuomorphism

The new two-image reference set was provided in the 26 October design
conversation and described in [STAR-AWAKENING.md](STAR-AWAKENING.md).
Reference pixels are not committed production assets.

## 4. Ecosystem Typography Standard

**Default for all aiaiaiai products:**

| Purpose | Typeface |
| --- | --- |
| Headings and body text | Geist Sans Variable |
| Italic accents | Geist Sans Italic |
| Code and technical labels | Geist Mono |

**Precedence rule:** A product's explicitly chosen typeface takes precedence over the organization-wide default.

This standard does not call for automatically rewriting existing product UIs. A White Canvas baseline does not need to load fonts at all; the future interactive scene should load only fonts actually used.

Söhne was considered as an aesthetic reference, but was not selected because of its paid license. Geist is the agreed default.

## 5. Development and Release Policy

1. **Progressive evolution:** The website develops in small, complete functional increments.
2. **Stable-only production:** The public site contains stable releases only; alpha, beta, and release candidates are not production releases.
3. **No placeholders:** No nonfunctional demos or promises in the UI.
4. **Explicit product boundaries:** The website does not absorb child-product interfaces or duplicate their internal logic.
5. **Controlled delivery:** Full CI verifies correctness → Validate verifies deployability (where applicable) → merge requires explicit approval → a separate manual deployment/release requires approval.
6. **No automatic production deployment** after merge.

The Star Awakening scene is the currently agreed interactive design direction; its actual first public release remains conditional on full implementation and approval. Portals, product navigation, and other interactive elements are separate future scopes, not implied by the scene.

## 6. Release Acceptance Boundaries

**For a safe White Canvas baseline (if released before the interactive scene):**
- `/` is served correctly over HTTPS and appears uniformly `#FFFFFF` without
  unexpected margins, scrolling, visible UI, unnecessary external dependencies
  or resource downloads.
- Accessibility, metadata, and CI/deploy validation remain appropriate.

**For a Star Awakening release:**
- The true-3D scene, physical press/depth transition, real state-driven colored
  satellites, input accessibility, failure handling and runtime integration
  meet the acceptance criteria in [STAR-AWAKENING.md](STAR-AWAKENING.md).
- No fake loader progression or speculative “ready” state is shown as real.
- The full experience is tested and the release is approved separately.

**No release name, version, production scope, or production launch has been approved.**
`White Canvas` / `v1.0.0` were earlier suggestions, not official tags.

## 7. Current State: Established vs. Unverified

**Established:** Site purpose, stable-only product behavior, Geist typography,
Star Awakening visual and physical-interaction direction, four `ai` colors,
the repository, and the need for a genuine loader-state adapter.

**Not yet implemented or verified:** Website code, runtime/model selection,
3D scene, loader stages, CI, deploy configuration, public release, and
operational production deployment. Nothing in the concept claims those exist.

**Open:** Exact WebLLM model, stage-to-color mapping, visual timings, supported
hardware, post-ready interface, and the first release's final scope.

## 8. Next Step

Implement the agreed interaction **through independently reviewable PRs**
following [STAR-AWAKENING.md](STAR-AWAKENING.md): real 3D scene, physical
transition, observable satellite status, genuine model integration, then
release hardening. The white-only baseline remains an optional intermediate
public state; an unfinished visual-only loader cannot be presented as complete.

Full CI → Validate where applicable → explicitly authorized merge → separately
authorized manual deployment. Do not merge or deploy based on this document.

---

© 2026 aiaiaiai · aiaiaiai.org
