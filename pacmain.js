import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- BASICS ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(4, 8, 8);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

// --- LIGHTS ---
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(3,7,3);
scene.add(dir);

// --- MAZE MAP ---
const map = [
  "1111111",
  "1.....1",
  "1.1.1.1",
  "1.2.2.1",
  "1.....1",
  "1111111"
];
const walls=[], dots=[], shinyDots=[], dotRadius=0.22;

// --- FLOOR ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial({ color: "#232323" }));
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- PLAYER ---
const player = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), new THREE.MeshStandardMaterial({color:"yellow"}));
player.position.set(1,0.4,1);
scene.add(player);

// --- GHOST ---
const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 20), new THREE.MeshStandardMaterial({color:"white"}));
ghost.position.set(3,0.45,3);
scene.add(ghost);
let ghostMode = "normal";

// --- MAZE + DOTS ---
map.forEach((row, z) => {
  [...row].forEach((cell, x) => {
    if(cell === "1") {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({color: "#333"}));
      wall.position.set(x,0.5,z); scene.add(wall); walls.push(wall);
    } else {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(dotRadius, 10, 10), new THREE.MeshStandardMaterial({color:"yellow"}));
      dot.position.set(x,0.2,z); scene.add(dot); dots.push(dot);
      if(cell==="2"){ dot.material.color.set("skyblue"); shinyDots.push(dot);}
    }
  });
});

// --- MOVEMENT ---
let keys={}, speed=0.09, score=0, lives=5;
onkeydown = e => keys[e.key.toLowerCase()] = true;
onkeyup = e => keys[e.key.toLowerCase()] = false;

function movePlayer() {
  let dx=0, dz=0;
  if(keys["w"]) dz -= speed;
  if(keys["s"]) dz += speed;
  if(keys["a"]) dx -= speed;
  if(keys["d"]) dx += speed;
  const np = player.position.clone();
  np.x += dx; np.z += dz;
  let blocked = walls.some(w => np.distanceTo(w.position) < 0.65);
  if(!blocked) player.position.copy(np);
}

function moveGhost() {
  const diff = player.position.clone().sub(ghost.position).normalize();
  const gSpeed = ghostMode==="weak"?0.01:0.023;
  ghost.position.x += diff.x * gSpeed;
  ghost.position.z += diff.z * gSpeed;
}

function checkCollisions() {
  // Dot
  for(let i=dots.length-1;i>=0;i--) {
    if(player.position.distanceTo(dots[i].position)<0.38){
      scene.remove(dots[i]);
      if(shinyDots.includes(dots[i])){
        ghost.material.color.set("blue");
        ghostMode="weak"; setTimeout(()=>{ghost.material.color.set("white");ghostMode="normal";},7000);
      }
      dots.splice(i,1); score++; updateHUD();
    }
  }
  // Ghost
  if(player.position.distanceTo(ghost.position)<0.5){
    if(ghostMode==="normal"){lives--;player.position.set(1,0.4,1);}
    else{ghost.position.set(3,0.45,3);}
    updateHUD();
    if(lives<=0) { alert("GAME OVER! Reload!"); lives=0; }
  }
}

function updateHUD() {
  document.getElementById("hud").textContent = `Score: ${score} | Lives: ${lives}`;
}

function animate(){
  requestAnimationFrame(animate);
  movePlayer();
  moveGhost();
  checkCollisions();
  renderer.render(scene,camera);
}
animate();
