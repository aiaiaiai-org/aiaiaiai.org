// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import { Motion } from './motion';
import { createScene } from './scene';
import {
  StageTimeline,
  pulseFrames,
  type RuntimeStageSource,
  type StageEvent,
} from './stages';
import './style.css';

export function mount(root: HTMLElement, runtime?: RuntimeStageSource) {
  const target = root.querySelector<HTMLButtonElement>('.star-target')!;
  const status = root.querySelector<HTMLElement>('[role=status]')!;
  const reset = root.querySelector<HTMLButtonElement>('.reset')!;
  const events = new AbortController();
  const motion = new Motion();
  const stages = new StageTimeline();
  const stageLabels = Array.from(
    root.querySelectorAll<HTMLElement>('.stage-track [data-stage]'),
  );
  let runtimeStarted = false;
  let unsubscribe: (() => void) | null = null;
  let stageTimer: number | null = null;
  let stageFrame = 0;
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
    scene.render(reduced.matches ? 0 : time, stages.snapshots(), reduced.matches);
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
  function drawStages() {
    const active = stages.snapshots().find((stage) => stage.status === 'active');
    for (const stage of stages.snapshots()) {
      const node = stageLabels.find((item) => item.dataset.stage === stage.id);
      if (!node) continue;
      node.dataset.status = stage.status;
      const suffix =
        active?.id === stage.id && !reduced.matches
          ? pulseFrames[stageFrame]
          : '';
      node.textContent = stage.id + suffix;
    }
  }
  function restartStageCycle() {
    if (stageTimer !== null) window.clearInterval(stageTimer);
    stageTimer = null;
    stageFrame = 0;
    drawStages();
    if (
      !disposed &&
      !failed &&
      !document.hidden &&
      !reduced.matches &&
      stages.snapshots().some((stage) => stage.status === 'active')
    ) {
      stageTimer = window.setInterval(() => {
        stageFrame = (stageFrame + 1) % pulseFrames.length;
        drawStages();
      }, 420);
    }
  }
  function onStageEvent(event: StageEvent) {
    if (!runtimeStarted || failed || disposed || !stages.apply(event)) return;
    restartStageCycle();
    if (event.type === 'start') {
      status.textContent = event.stage + ' started.';
    } else if (event.type === 'complete') {
      status.textContent =
        event.stage === 'awakening'
          ? 'Runtime ready. Study remains active.'
          : event.stage + ' complete.';
    } else if (event.type === 'fail') {
      // Provider errors may contain secrets or private identifiers.
      status.textContent = event.stage + ' failed. Reload to try again.';
      reset.textContent = 'Reload preview';
      reset.hidden = false;
    }
    // Progress bytes are recorded, not converted into invented percentages.
    wake();
  }
  function runtimeFailure(error: unknown) {
    console.error('Model runtime could not start', error);
    status.textContent = 'Model runtime could not start. Reload to try again.';
    reset.textContent = 'Reload preview';
    reset.hidden = false;
    if (stageTimer !== null) window.clearInterval(stageTimer);
    stageTimer = null;
  }
  function activate() {
    if (failed || disposed || !motion.activate()) return;
    runtimeStarted = true;
    status.textContent =
      'Spatial transition activated. No model runtime is connected; no download has started.';
    if (runtime) {
      try {
        unsubscribe = runtime.subscribe(onStageEvent);
        // No assets or compute are requested until the user activates the star.
        void runtime.start().catch(runtimeFailure);
      } catch (error) {
        runtimeFailure(error);
      }
    }
    update();
    restartStageCycle();
    wake();
  }
  // iOS elastic overscroll can move the viewport while scrollY stays zero.
  // Measure the downward pull without blocking Safari's native gesture.
  const fadeDistance = 40;
  let pullStart: { id: number; y: number } | null = null;
  function endPull() {
    pullStart = null;
    delete root.dataset.pulling;
    status.style.opacity = '';
  }
  const passiveTouch = { signal: events.signal, passive: true };
  root.addEventListener(
    'touchstart',
    (event) => {
      if (
        event.touches.length !== 1 ||
        window.scrollY > 0 ||
        (event.target instanceof Element &&
          event.target.closest('.star-target, .reset'))
      ) {
        endPull();
        return;
      }
      const touch = event.touches[0]!;
      pullStart = { id: touch.identifier, y: touch.clientY };
    },
    passiveTouch,
  );
  root.addEventListener(
    'touchmove',
    (event) => {
      if (!pullStart || event.touches.length !== 1) return;
      const touch = event.touches[0]!;
      if (touch.identifier !== pullStart.id) return;
      root.dataset.pulling = 'true';
      const distance = Math.max(0, touch.clientY - pullStart.y);
      status.style.opacity = String(Math.max(0, 1 - distance / fadeDistance));
    },
    passiveTouch,
  );
  // End only the tracked finger; another finger ending must not cancel the pull.
  function onPullEnd(event: TouchEvent) {
    if (
      !pullStart ||
      ![...event.changedTouches].some(
        (touch) => touch.identifier === pullStart!.id,
      )
    )
      return;
    endPull();
  }
  root.addEventListener('touchend', onPullEnd, { signal: events.signal });
  root.addEventListener('touchcancel', onPullEnd, { signal: events.signal });

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
      restartStageCycle();
    },
    options,
  );
  reduced.addEventListener(
    'change',
    () => {
      restartStageCycle();
      wake();
    },
    options,
  );
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
    if (stageTimer !== null) window.clearInterval(stageTimer);
    unsubscribe?.();
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
      inspect: () => ({
        phase: motion.phase,
        ...scene.inspect(),
        stages: stages.snapshots(),
      }),
      // Deterministic fixture available only on the local DEV preview.
      emitStage: onStageEvent,
    };
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  update();
  drawStages();
  wake();
  return dispose;
}

type PreviewWindow = Window & {
  __awakening?: {
    inspect: () => unknown;
    emitStage: (event: StageEvent) => void;
  };
};
