// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import * as THREE from 'three';
import { Motion, pose, satelliteIds } from './motion';

export function createScene(
  host: HTMLElement,
  target: HTMLButtonElement,
  motion: Motion,
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f7f7f5');
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  const light = new THREE.DirectionalLight('#fff9ed', 3.3);
  light.position.set(-3, 4, 6);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = light.shadow.camera.bottom = -4;
  light.shadow.camera.right = light.shadow.camera.top = 4;
  light.shadow.bias = -0.0005;
  light.shadow.normalBias = 0.025;
  light.shadow.radius = 5;
  scene.add(light, new THREE.HemisphereLight('#f3f6ff', '#b9b8b1', 2.6));
  const fill = new THREE.DirectionalLight('#dce8ff', 1.4);
  fill.position.set(4, -2, 3);
  scene.add(fill);

  // Deterministic fine-grained normal relief; no image or network dependency.
  const pixels = new Uint8Array(128 * 128 * 4);
  let seed = 4729;
  for (let i = 0; i < pixels.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = 115 + (seed % 26);
    pixels[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, 128, 128);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.needsUpdate = true;
  const material = new THREE.MeshPhysicalMaterial({
    color: '#eeeee9',
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.45,
    bumpMap: texture,
    bumpScale: 0.012,
  });
  const geometry = new THREE.SphereGeometry(1, 64, 40);
  const star = new THREE.Mesh(geometry, material);
  star.name = 'star';
  star.castShadow = star.receiveShadow = true;
  scene.add(star);
  const satellites = satelliteIds.map((id) => {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = id;
    sphere.scale.setScalar(0.34);
    sphere.castShadow = sphere.receiveShadow = true;
    scene.add(sphere);
    return sphere;
  });
  const backdropGeometry = new THREE.PlaneGeometry(60, 60);
  const backdropMaterial = new THREE.MeshStandardMaterial({
    color: '#f7f7f5',
    roughness: 0.75,
    bumpMap: texture,
    bumpScale: 0.008,
  });
  const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
  backdrop.position.z = -2.2;
  backdrop.receiveShadow = true;
  scene.add(backdrop);
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, 1.7, 1.33, 0, Math.PI * 2, false, 0)
      .getPoints(128)
      .map((p) => new THREE.Vector3(p.x, p.y, -1.1)),
  );
  const ringMaterial = new THREE.LineBasicMaterial({
    color: '#b9bab7',
    transparent: true,
    opacity: 0.25,
  });
  scene.add(new THREE.LineLoop(ringGeometry, ringMaterial));
  const center = new THREE.Vector3();
  const edge = new THREE.Vector3();
  let width = 1;
  let height = 1;

  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.position.z = 7.4 / Math.min(camera.aspect, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  function render(time: number) {
    const positions = pose(motion.depth, time);
    star.position.z = positions.starZ - motion.compression * 0.12;
    star.scale.set(
      0.94 + motion.compression * 0.035,
      0.94 + motion.compression * 0.035,
      0.94 - motion.compression * 0.13,
    );
    positions.satellites.forEach((p, index) =>
      satellites[index]!.position.set(p.x, p.y, p.z),
    );
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    center.copy(star.position).project(camera);
    edge
      .copy(star.position)
      .add(new THREE.Vector3(star.scale.x, 0, 0))
      .project(camera);
    const diameter = Math.max(44, (edge.x - center.x) * width);
    Object.assign(target.style, {
      left: `${((center.x + 1) * width) / 2}px`,
      top: `${((1 - center.y) * height) / 2}px`,
      width: `${diameter}px`,
      height: `${diameter}px`,
    });
    renderer.render(scene, camera);
  }
  resize();
  return {
    canvas: renderer.domElement,
    resize,
    render,
    // Used only by development browser checks, never emitted in the release.
    inspect: () => ({
      star: star.position.toArray(),
      satellites: satellites.map((s) => ({
        id: s.name,
        position: s.position.toArray(),
      })),
      calls: renderer.info.render.calls,
    }),
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      backdropGeometry.dispose();
      backdropMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      light.shadow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
