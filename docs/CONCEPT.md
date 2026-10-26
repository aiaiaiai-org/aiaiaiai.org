# aiaiaiai.org — Website Concept and Agreed Decisions

**Status:** Concept agreed; implementation and first release version not yet approved  
**Decision date:** 25 October 2026  
**Website:** https://aiaiaiai.org  
**Repository:** https://github.com/aiaiaiai-org/aiaiaiai.org

## 1. Purpose

aiaiaiai.org is an independent entry point into the **aiaiaiai** universe. It will **gain functionality incrementally through stable releases**. It is not a conventional corporate landing page, a roadmap presentation, or a product directory.

**Core principle:** The website presents only what has actually been completed, verified, and released. Missing functionality is not disguised with announcements or decorative placeholders.

## 2. Initial State: White Canvas

At launch, visitors see **nothing but a completely white screen (`#FFFFFF`)**.

- No visible text, logo, navigation, buttons, cards, illustrations, or animations.
- No "Coming soon" messages, teasers, product lists, or previews of future functionality.
- No demos or interactive elements that have not become stable features.
- Technical foundations may exist invisibly, but must not introduce visible UI.

The white screen is **an intentional initial product state**, not a message that development is unfinished.

## 3. Future Visual Language

A long-term design direction, **not content for the first release**:

- **White-first:** White space remains the visual foundation.
- **Glassmorphism:** Glass-like surfaces, transparency, refraction, restrained highlights.
- **Skeuomorphism:** Material realism, physical depth, tactility, and convincing interaction feedback.
- **Distinctive without visual noise:** A new element appears only when it serves a complete function.

References provided for the visual direction:

- https://share.google/0OurBOYtnP63bfQa0 — glassmorphism
- https://share.google/h8nngPyBFdxtMbgw1 — glassmorphism
- https://share.google/JjCwSJGNSIhqTXhwu — skeuomorphism

> These references establish the direction, but their specific visual details were not verified by direct inspection. The earlier glass-portal mockup is **only a design exploration**, not an approved production interface.

## 4. Ecosystem Typography Standard

**Default for all aiaiaiai products:**

| Purpose | Typeface |
| --- | --- |
| Headings and body text | Geist Sans Variable |
| Italic accents | Geist Sans Italic |
| Code and technical labels | Geist Mono |

**Precedence rule:** A product's explicitly chosen typeface takes precedence over the organization-wide default.

This standard does not call for automatically rewriting existing product UIs. The completely blank initial page does not need to load fonts at all until text is introduced.

Söhne was considered as an aesthetic reference, but was not selected because of its paid license. Geist is the agreed default.

## 5. Development and Release Policy

1. **Progressive evolution:** The website develops in small, complete functional increments.
2. **Stable-only production:** The public site contains stable releases only; alpha, beta, and release candidates are not production releases.
3. **No placeholders:** No nonfunctional demos or promises in the UI.
4. **Explicit product boundaries:** The website does not absorb child-product interfaces or duplicate their internal logic.
5. **Controlled delivery:** Full CI verifies correctness → Validate verifies deployability (where applicable) → merge requires explicit approval → a separate manual deployment/release requires approval.
6. **No automatic production deployment** after merge.

New elements, including portals, navigation into products, and interactive objects, **are outside the initial scope**. Each will be defined and evaluated separately for a future release.

## 6. Proposed First-Release Acceptance Criteria

- The root route `/` is served correctly over HTTPS.
- The visible result on desktop and mobile is uniformly pure `#FFFFFF`, without unintended margins or scrolling.
- No visible UI, unnecessary external dependencies, or needless resource downloads.
- Accessibility, metadata, and page behavior remain compatible with the blank-screen requirement.
- Tests and release checks pass; production release is authorized separately.

**The name `White Canvas` and version `v1.0.0` were suggested during the discussion, but neither has been approved as an actual release name, tag, or version.**

## 7. Current State: Established vs. Unverified

**Established:** The intended purpose, initial blank-screen state, future visual direction, typography default, and GitHub repository.

**Not confirmed as completed:** Repository implementation, CI, deployment configuration, a release, or working production deployment. The earlier local interactive prototype is not a release and must not be shipped to production in place of White Canvas.

## 8. Next Step

Prepare a **minimal White Canvas implementation** in `aiaiaiai-org/aiaiaiai.org` as a small, separate PR (without merging or deploying before explicit approval), after inspecting the repository structure and existing contracts. Approve the version and integrate its release with `aiaiaiai-org/infra` only when required for an actual deployment.

---

© 2026 aiaiaiai · aiaiaiai.org
