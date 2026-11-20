# Immutable aiaiaiai.org site artifacts

The website produces separately version-prefixed static assets for each source ref. Both beta and release publishing jobs run *inside the exact push-triggered Full CI*, after Validate; there is no privileged cross-workflow publisher.

- Full CI on **every successful post-merge `master` commit** builds with `SITE_SNAPSHOT_BASE=/<full-source-sha>`.
- Full CI on an approved `vX.Y.Z` tag push builds with `SITE_SNAPSHOT_BASE=/<tag>`.
- The build output carries `/_astro/` references only under that base path.
- `Full CI / Publish merge-SHA beta image` publishes each green master push to GHCR and attests its exact master SHA.
- `Publish release image` verifies `GITHUB_REF=refs/tags/vX.Y.Z` against the CI artifact source manifest and publishes the green Full CI artifact, after verifying the tag resolves to an ancestor of master.
- Infra automatically reconciles both channels after an authorized initial site cutover. Neither image publication by itself is an authorization to activate `aiaiaiai.org` or change public DNS; Infra owns activation and immutable archiving.

Canonical public routes: `beta.aiaiaiai.org/{full SHA}` and `aiaiaiai.org/{release tag}`. Their parent hosts point to the latest successfully activated snapshot. The root apex redirects to the beta host until a release is approved.

Note: Release and beta are built independently for their respective public base paths. Their image digests are distinct even when a tag resolves to the same commit. Never rebuild an already published tag or overwrite an immutable archive; Infra validates the digest and provenance before staging.

© 2026 aiaiaiai · aiaiaiai.org

Release provenance is generated in the same tag-triggered Full CI workflow after Validate, so the attestation carries `refs/tags/vX.Y.Z` and its source commit rather than the default branch of a separate workflow run.

Each successful master push publishes its own immutable SHA image, even if a
newer merge arrives before publishing completes. Infra archives the available
master revisions but advances `beta.aiaiaiai.org/` only when the attested
version is still the current master head. This prevents lost merge snapshots
and late-build rollbacks.

Beta provenance is likewise generated inside the original `refs/heads/master` push-triggered Full CI, so an older merge SHA remains correctly attested even after subsequent merges move the branch head.
