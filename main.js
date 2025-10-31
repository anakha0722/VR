// main.js
import * as THREE from 'three';

let scene, camera, renderer;
let basket, eggs = [];
let score = 0, missed = 0;
let running = false;
const eggSpeed = 0.2
const spawnIntervalMs = 1500;
let lastSpawn = 0;
const basketSpeed = 0.25;

// UI elements
const totalEl = document.getElementById('total');
const missedEl = document.getElementById('missed');
const startEl = document.getElementById('start');

init();
animate(0);

function init() {
  // Scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // Ground plane (visual reference)
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Basket (player) - a simple box
  const basketGeo = new THREE.BoxGeometry(2, 0.6, 1);
  const basketMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
  basket = new THREE.Mesh(basketGeo, basketMat);
  basket.position.set(0, 0.3, 0);
  scene.add(basket);

  // Window resize handling
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function onKeyDown(e) {
  if (e.key === 's' || e.key === 'S') {
    if (!running) {
      running = true;
      startEl.style.display = 'none';
      lastSpawn = performance.now();
    }
  }
  // left/right controls for basket
  if (e.key === 'ArrowLeft') basket.position.x -= basketSpeed;
  if (e.key === 'ArrowRight') basket.position.x += basketSpeed;

  // clamp basket to stay roughly within -12..12
  basket.position.x = Math.max(-12, Math.min(12, basket.position.x));
}

function spawnEgg() {
  const geo = new THREE.SphereGeometry(0.35, 12, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const egg = new THREE.Mesh(geo, mat);
  // spawn x randomly across a range, y high so it falls down, z slightly in front
  egg.position.set((Math.random() - 0.5) * 20, 8, (Math.random() - 0.5) * 2);
  eggs.push(egg);
  scene.add(egg);
}

function animate(time) {
  requestAnimationFrame(animate);

  // time is in ms
  if (running) {
    // spawn logic (simple time-based)
    if (time - lastSpawn > spawnIntervalMs) {
      spawnEgg();
      lastSpawn = time;
    }

    // update eggs: fall, collision check, remove if below ground
    for (let i = eggs.length - 1; i >= 0; i--) {
      const egg = eggs[i];
      egg.position.y -= eggSpeed * (60 / 16); // scalable-ish speed

      // simple catch check: distance between egg and basket
      const dx = egg.position.x - basket.position.x;
      const dz = egg.position.z - basket.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);

      if (egg.position.y < 0.6) {
        // if near basket horizontally => caught
        if (dist < 1.5) {
          score += 1;
          totalEl.textContent = score;
        } else {
          missed += 1;
          missedEl.textContent = missed;
        }
        // remove egg
        scene.remove(egg);
        eggs.splice(i, 1);
      }
    }
  }

  renderer.render(scene, camera);
}
