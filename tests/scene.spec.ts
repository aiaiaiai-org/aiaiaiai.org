// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import { expect, test } from '@playwright/test';

type Snapshot = {
  phase: string;
  star: number[];
  satellites: { id: string; position: number[] }[];
  calls: number;
};
const inspect = () =>
  (
    window as unknown as Window & { __awakening: { inspect: () => Snapshot } }
  ).__awakening.inspect();

test('real meshes exchange depth on activation without runtime requests', async ({
  page,
  isMobile,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4321'))
      external.push(request.url());
  });
  await page.goto('/');
  const target = page.getByRole('button', { name: 'Awaken the star' });
  await expect(target).toBeEnabled();
  await expect
    .poll(() => page.evaluate(inspect).then((s) => s.calls))
    .toBeGreaterThan(0);
  const before = await page.evaluate(inspect);
  expect(before.satellites).toHaveLength(4);
  expect(before.satellites.every((s) => s.position[2]! < before.star[2]!)).toBe(
    true,
  );
  if (isMobile) await target.tap();
  else await target.click();
  await expect(page.locator('#awakening')).toHaveAttribute(
    'data-phase',
    'settled',
  );
  const after = await page.evaluate(inspect);
  expect(after.star[2]).toBeLessThan(before.star[2]!);
  expect(after.satellites.every((s) => s.position[2]! > after.star[2]!)).toBe(
    true,
  );
  expect(external).toEqual([]);
  await expect(page.getByRole('status')).toContainText(
    'no download has started',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('pointer cancellation returns to idle; keyboard activation remains available', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByRole('button', { name: 'Awaken the star' });
  await expect(target).toBeEnabled();
  const box = await target.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect(page.locator('#awakening')).toHaveAttribute(
    'data-phase',
    'pressing',
  );
  await target.dispatchEvent('pointercancel');
  await page.mouse.up();
  await expect(page.locator('#awakening')).toHaveAttribute(
    'data-phase',
    'idle',
  );
  await target.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#awakening')).toHaveAttribute(
    'data-phase',
    'settled',
  );
});

test('reduced motion freezes orbit, supports Enter, and context loss is recoverable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const target = page.getByRole('button', { name: 'Awaken the star' });
  await expect(target).toBeEnabled();
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#awakening')).toHaveAttribute(
    'data-phase',
    'settled',
  );
  const before = await page.evaluate(inspect);
  await page.waitForTimeout(120);
  expect(await page.evaluate(inspect)).toEqual(before);
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  await expect(page.getByRole('status')).toContainText(
    'graphics context was lost',
  );
  await expect(
    page.getByRole('button', { name: 'Reload preview' }),
  ).toBeVisible();
});

test('unsupported WebGL exposes an honest fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('3D is unavailable');
  await expect(
    page.getByRole('button', { name: 'Awaken the star' }),
  ).toBeHidden();
});
