# Star Awakening implementation

This implements the scene foundation and physical input described in
[design PR #3](https://github.com/aiaiaiai-org/aiaiaiai.org/pull/3).
The documentation remains in its own PR. This implementation starts from
`master` at `3c0bebe2a7aff3639643b34ae80a8be7d34ef4b4` following the user's
26 October instruction to proceed using that design.

## Run and verify

Use Node 24, `npm ci`, then `npm run dev`. The development root shows the
interaction study. `npm run check`, `npm test` and `npm run test:browser`
check types, spring/depth invariants and real browser input/rendering.
Playwright needs its Chromium installed (`npx playwright install chromium`).

Astro supplies the shell; Three.js owns five sphere meshes, perspective,
materials, lighting and shadows. A bounded, substepped spring changes actual
geometry along Z. The motion controller owns no model state or network work.
Pointer cancellation, release outside the target, focus loss and hidden tabs
cancel an incomplete press. Activation is idempotent. Reduced motion stops
the orbit and resolves to stable depth without overshoot. Graphics failures
have a visible fallback and context loss offers a full reload.

The model, stage mapping and post-ready experience remain unselected.
No runtime, progress percentage, completed satellite color or ready state is
fabricated. `settled` means only that the physical transition has settled.

## Production boundary

`npm run build` emits the blank White Canvas baseline. The development UI
is guarded by Astro's development mode, not a query parameter or a production
environment flag. The production document must contain no preview DOM,
canvas or script. Validate checks this on the actual serving container.
The scene must remain development-only until real runtime integration and
the remaining design acceptance criteria are complete.

## Delivery through infra

`ci.yml` is an unprivileged Full CI / Validate workflow: pull requests run it
read-only. It builds the static site with version-prefixed Astro asset paths,
validates `/healthz`, `/`, the beta route and immutable assets, then preserves
`site-image.tar.gz` with a source-ref/SHA manifest. Neither job publishes or
deploys.

A merge to `master` triggers the push-only `publish.yml`, which calls that
same reusable CI and publishes an attested, immutable GHCR image tagged with
the **actual master merge SHA**, available at `beta.aiaiaiai.org/<full SHA>/`
after an authorized origin cutover. A separately approved SemVer tag (`vX.Y.Z`)
triggers an independently validated image at `aiaiaiai.org/<tag>/`. If an image
was pushed before attestation failed, the publisher can resume without
replacing the immutable tag, but only when the validated image ID matches.

`aiaiaiai-org/infra` verifies the exact signer (`.github/workflows/publish.yml`),
source ref/SHA and digest before staging content in a private snapshot archive
on `edge-dev-1`, while preserving historical version assets. Infra freezes
legacy `edge-prod-2` automatic delivery; the old site remains rollback-only.
The existing `nilx.one` public Caddy remains the sole 80/443 ingress. Initial
snapshot staging, public ingress adoption and DNS cutover require separate
operator authorization. After cutover, enable scheduled reconciler delivery
explicitly; it advances beta/current or release/current only after checks.

See `docs/VERSIONED-ARTIFACTS.md` for immutable routes and release provenance.
Real-server smoke tests, TLS and rollback checks remain required before the
new public origin is considered live.

© 2026 aiaiaiai · aiaiaiai.org
