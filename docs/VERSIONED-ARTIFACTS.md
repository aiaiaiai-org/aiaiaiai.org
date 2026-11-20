# Immutable aiaiaiai.org site artifacts

The website produces separately version-prefixed static assets for each source ref.

- Full CI on the actual **post-merge `master` commit** builds with `SITE_SNAPSHOT_BASE=/<full-source-sha>`.
- Full CI on an approved `vX.Y.Z` tag push builds with `SITE_SNAPSHOT_BASE=/<tag>`.
- The build output carries `/_astro/` references only under that base path.
- `Publish development image` publishes green master-head artifacts to GHCR.
- `Publish release image` verifies `GITHUB_REF=refs/tags/vX.Y.Z` against the CI artifact source manifest and publishes the green Full CI artifact, after verifying the tag resolves to an ancestor of master.
- Infra automatically reconciles both channels after an authorized initial site cutover. Neither image publication by itself is an authorization to activate `aiaiaiai.org` or change public DNS; Infra owns activation and immutable archiving.

Canonical public routes: `beta.aiaiaiai.org/{full SHA}` and `aiaiaiai.org/{release tag}`. Their parent hosts point to the latest successfully activated snapshot. The root apex redirects to the beta host until a release is approved.

Note: Release and beta are built independently for their respective public base paths. Their image digests are distinct even when a tag resolves to the same commit. Never rebuild an already published tag or overwrite an immutable archive; Infra validates the digest and provenance before staging.

© 2026 aiaiaiai · aiaiaiai.org

Release provenance is generated in the same tag-triggered Full CI workflow after Validate, so the attestation carries `refs/tags/vX.Y.Z` and its source commit rather than the default branch of a separate workflow run.
