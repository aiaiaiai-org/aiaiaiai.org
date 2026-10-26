// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import { Motion } from './motion';
import { createScene } from './scene';
import './style.css';

export function mount(root: HTMLElement) {
  const target = root.querySelector<HTMLButtonElement>('.star-target')!;
  const status = root.querySelector<HTMLElement>('[role=status]')!;
  const reset = root.querySelector<HTMLButtonElement>('.reset')!;
  const events = new AbortController();
  const motion = new Motion();
  let frame = 0;
  let last = 0;
  let time = 0;
  let disposed = false;
  let failed = false;
  let pointer: number | null = null;
  let key: string | null = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scene: ReturnType<typeof createScene>;
  try {
    scene = createScene(root.querySelector('.scene')!, target, motion);
  } catch (error) {
    console.error('3D renderer unavailable', error);
    root.dataset.failed = 'true';
    target.hidden = true;
    status.textContent =
      '3D is unavailable in this browser. Try a browser with WebGL 2 enabled. No model was downloaded.';
    return;
  }
  target.disabled = false;
  function update() {
    root.dataset.phase = motion.phase;
    target.setAttribute(
      'aria-disabled',
      String(motion.phase === 'transitioning' || motion.phase === 'settled'),
    );
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || failed || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    if (!reduced.matches) time += dt;
    motion.step(dt, reduced.matches);
    scene.render(reduced.matches ? 0 : time);
    update();
    if (!reduced.matches || motion.moving) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && !disposed && !failed && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function cancel() {
    pointer = null;
    key = null;
    motion.cancel();
    update();
    wake();
  }
  function activate() {
    if (failed || disposed || !motion.activate()) return;
    status.textContent =
      'Spatial transition activated. No model runtime is connected; no download has started.';
    update();
    wake();
  }
  const options = { signal: events.signal };
  target.addEventListener(
    'pointerdown',
    (event) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        pointer !== null ||
        key !== null ||
        failed
      )
        return;
      if (!motion.press(event.pointerType === 'pen' ? event.pressure : 0))
        return;
      pointer = event.pointerId;
      target.setPointerCapture(event.pointerId);
      update();
      wake();
    },
    options,
  );
  target.addEventListener(
    'pointerup',
    (event) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      const box = target.getBoundingClientRect();
      const inside =
        Math.hypot(
          (event.clientX - box.left - box.width / 2) / (box.width / 2),
          (event.clientY - box.top - box.height / 2) / (box.height / 2),
        ) <= 1;
      if (inside) activate();
      else cancel();
    },
    options,
  );
  target.addEventListener('pointercancel', cancel, options);
  target.addEventListener(
    'lostpointercapture',
    () => {
      if (pointer !== null) cancel();
    },
    options,
  );
  target.addEventListener(
    'keydown',
    (event) => {
      if (
        !['Enter', ' '].includes(event.key) ||
        event.repeat ||
        pointer !== null
      )
        return;
      event.preventDefault();
      if (motion.press()) {
        key = event.key;
        update();
        wake();
      }
    },
    options,
  );
  target.addEventListener(
    'keyup',
    (event) => {
      if (key !== event.key) return;
      event.preventDefault();
      key = null;
      activate();
    },
    options,
  );
  // Assistive technology activation has no pointer or key sequence.
  target.addEventListener(
    'click',
    (event) => {
      if (event.detail === 0 && key === null) activate();
    },
    options,
  );
  target.addEventListener('blur', cancel, options);
  window.addEventListener('blur', cancel, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      cancel();
    },
    options,
  );
  reduced.addEventListener('change', wake, options);
  const resize = new ResizeObserver(() => {
    scene.resize();
    wake();
  });
  resize.observe(root);
  scene.canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      root.dataset.failed = 'true';
      target.disabled = true;
      status.textContent =
        'The graphics context was lost. Reload to restore the preview. No model was downloaded.';
      reset.textContent = 'Reload preview';
      reset.hidden = false;
    },
    options,
  );
  // A reload recreates all GPU resources; no partially restored renderer is reused.
  reset.addEventListener('click', () => location.reload(), options);
  reset.hidden = false;
  function dispose() {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    events.abort();
    scene.dispose();
    delete (window as PreviewWindow).__awakening;
  }
  window.addEventListener('pagehide', dispose, { once: true });
  // Reload on BFCache return because pagehide released the renderer.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && disposed) location.reload();
  });
  if (import.meta.env.DEV)
    (window as PreviewWindow).__awakening = {
      inspect: () => ({ phase: motion.phase, ...scene.inspect() }),
    };
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  update();
  wake();
  return dispose;
}

type PreviewWindow = Window & { __awakening?: { inspect: () => unknown } };
