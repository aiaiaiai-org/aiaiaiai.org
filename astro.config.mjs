// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import { defineConfig } from 'astro/config';

const snapshotBase = process.env.SITE_SNAPSHOT_BASE;
if (
  snapshotBase &&
  !/^\/(?:[0-9a-f]{40}|v[0-9]+\.[0-9]+\.[0-9]+)$/.test(snapshotBase)
) {
  throw new Error(
    'SITE_SNAPSHOT_BASE must be a full commit SHA or a vX.Y.Z tag path',
  );
}

export default defineConfig({
  base: snapshotBase ?? '/',
  site: 'https://aiaiaiai.org',
  output: 'static',
  devToolbar: { enabled: false },
});
