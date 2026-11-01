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

Full CI builds once; Validate consumes `site-dist`, packages the container,
checks `/healthz`, `/`, unknown-route behavior and preview exclusion, then
preserves `site-image`. Neither job publishes or deploys.

Full CI also runs on every push to `master`, so each merged revision gets its
own verified `site-image`. When that run succeeds, **Deploy development**
starts automatically. It deploys only the current `master` revision and skips a
superseded run that finished late. It loads the verified container, pushes it
to `ghcr.io/aiaiaiai-org/aiaiaiai.org` and asks infra to activate `/beta`. It
does not rebuild anything. A manual dispatch with a Full CI run ID can still
select any verified ancestor of `master`, for example to roll back. Expired
artifacts require a new run. Production releases stay manual and separately
approved.

The separate `aiaiaiai-org/infra` **Deploy workload** workflow consumes the
reported immutable digest with workload `aiaiaiai-site`. Its contract owns
placement on `edge-prod-2`, network `aiaiaiai-edge`, port `1927` and public
host `aiaiaiai.org`. The site repository needs no SSH secrets or server
credentials. Private GHCR pulls use infra's existing registry credentials.

Deploy the workload before activating the apex edge route. DNS/TLS, an actual
container smoke check and real-device visual/performance testing remain release
verification obligations; local tests do not establish production readiness.

© 2026 aiaiaiai · aiaiaiai.org
