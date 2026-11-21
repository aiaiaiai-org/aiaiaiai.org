#!/usr/bin/env bash
# © 2026 aiaiaiai · aiaiaiai.org
# SPDX-License-Identifier: MPL-2.0
#
# Publish the validated site image to GHCR under one immutable tag and expose
# its digest for attestation. Safe to re-run after a partial failure:
#   * tag absent                  -> push it;
#   * tag present, identical image   -> reuse it (an earlier run pushed the image
#                                    but did not finish attesting);
#   * tag present, different image  -> fail; an immutable tag is never overwritten;
#   * registry state unprovable   -> fail rather than guess.
#
# Usage: publish-verified-image.sh <tarball> <image-ref>
# Requires a prior `docker login`. Appends `name=` and `digest=` to
# $GITHUB_OUTPUT when set.
set -Eeuo pipefail

tarball="${1:?usage: publish-verified-image.sh <tarball> <image-ref>}"
image="${2:?usage: publish-verified-image.sh <tarball> <image-ref>}"
local_ref="${LOCAL_IMAGE:-aiaiaiai-site:verified}"
repository="${image%:*}"

image_id() { docker inspect --format '{{.Id}}' "$1"; }

docker load -i "$tarball"
expected="$(image_id "$local_ref")"

if inspection="$(docker manifest inspect "$image" 2>&1)"; then
  docker pull --quiet "$image" >/dev/null
  if [[ "$(image_id "$image")" != "$expected" ]]; then
    echo "::error::$image already exists with different content; refusing to overwrite" >&2
    exit 1
  fi
  echo "::notice::$image already published with identical content; reusing it (resumed run)"
elif grep -Eqi 'no such manifest|manifest unknown' <<<"$inspection"; then
  docker tag "$local_ref" "$image"
  docker push "$image"
else
  echo "::error::Cannot prove $image is unpublished: $inspection" >&2
  exit 1
fi

reference="$(docker inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$image" | grep -F "$repository@" | head -n1)"
[[ "$reference" =~ ^.+@(sha256:[0-9a-f]{64})$ ]]
digest="${BASH_REMATCH[1]}"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "name=$repository"
    echo "digest=$digest"
  } >>"$GITHUB_OUTPUT"
fi
echo "$repository@$digest"
