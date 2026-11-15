import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TELECHOBIS, TelechobiId } from '../types/game';

interface Telechobi3DViewerProps {
  characterId: TelechobiId;
  wireframeEndo: boolean;
  spotlightTint: 'amber' | 'cold' | 'blood';
}

function buildCompositeTelechobi(
  id: TelechobiId,
  wireframeEndo: boolean
): THREE.Group {
  const meta = TELECHOBIS[id];
  const root = new THREE.Group();

  // Procedural felt & grime canvas texture
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 128;
  texCanvas.height = 128;
  const tctx = texCanvas.getContext('2d');
  if (tctx) {
    tctx.fillStyle = meta.suitColor;
    tctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 420; i++) {
      const gx = Math.random() * 128;
      const gy = Math.random() * 128;
      const r = 1 + Math.random() * 4;
      tctx.fillStyle = i % 3 === 0 ? 'rgba(0,0,0,0.28)' : 'rgba(40,32,20,0.18)';
      tctx.beginPath();
      tctx.arc(gx, gy, r, 0, Math.PI * 2);
      tctx.fill();
    }
  }
  const suitTexture = new THREE.CanvasTexture(texCanvas);
  suitTexture.colorSpace = THREE.SRGBColorSpace;

  const suitMat = new THREE.MeshStandardMaterial({
    map: suitTexture,
    roughness: 0.92,
    metalness: 0.05,
    wireframe: wireframeEndo,
    transparent: wireframeEndo,
    opacity: wireframeEndo ? 0.25 : 1,
  });

  const hoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(meta.hoodColor),
    roughness: 0.85,
    metalness: 0.08,
    wireframe: wireframeEndo,
    transparent: wireframeEndo,
    opacity: wireframeEndo ? 0.3 : 1,
  });

  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xd4c7b0,
    roughness: 0.42,
    metalness: 0.1,
    wireframe: wireframeEndo,
    transparent: wireframeEndo,
    opacity: wireframeEndo ? 0.3 : 1,
  });

  const endoMat = new THREE.MeshStandardMaterial({
    color: 0x52525b,
    roughness: 0.35,
    metalness: 0.88,
  });

  const eyeGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(meta.eyeColor),
    emissive: new THREE.Color(meta.eyeColor),
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });

  // 1. Grounded Feet (bottom-center pivot y=0)
  const footGeo = new THREE.CapsuleGeometry(0.2, 0.22, 6, 12);
  const leftFoot = new THREE.Mesh(footGeo, suitMat);
  leftFoot.rotation.x = Math.PI / 2;
  leftFoot.position.set(-0.32, 0.2, 0.08);
  leftFoot.castShadow = true;
  root.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, suitMat);
  rightFoot.rotation.x = Math.PI / 2;
  rightFoot.position.set(0.32, 0.2, 0.08);
  rightFoot.castShadow = true;
  root.add(rightFoot);

  // 2. Legs + Internal Endoskeleton Pistons
  const legGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.82, 12);
  const leftLeg = new THREE.Mesh(legGeo, suitMat);
  leftLeg.position.set(-0.3, 0.68, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, suitMat);
  rightLeg.position.set(0.3, 0.68, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  const endoSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.55, 10), endoMat);
  endoSpine.position.set(0, 1.45, 0);
  root.add(endoSpine);

  // 3. Plush Torso + Exposed Rib Struts
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 1.05, 16), suitMat);
  torso.position.set(0, 1.55, 0);
  torso.castShadow = true;
  root.add(torso);

  for (let r = 0; r < 3; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 8, 18), endoMat);
    rib.rotation.x = Math.PI / 2;
    rib.position.set(0, 1.35 + r * 0.18, 0.02);
    root.add(rib);
  }

  // 4. Jagged Collar
  const collar = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.32, 8), hoodMat);
  collar.rotation.x = Math.PI;
  collar.position.set(0, 2.02, 0);
  root.add(collar);

  // 5. Arms & Mechanical Hands
  const armGeo = new THREE.CapsuleGeometry(0.13, 0.62, 6, 12);
  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.position.set(-0.62, 1.62, 0.05);
  leftArm.rotation.z = 0.24;
  leftArm.castShadow = true;
  root.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.position.set(0.62, 1.62, 0.05);
  rightArm.rotation.z = -0.24;
  rightArm.castShadow = true;
  root.add(rightArm);

  // 6. Head Assembly (Group for idle creepy twitch)
  const headGroup = new THREE.Group();
  headGroup.name = 'headGroup';
  headGroup.position.set(0, 2.48, 0);

  const hoodSphere = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 18), hoodMat);
  hoodSphere.castShadow = true;
  headGroup.add(hoodSphere);

  // Character-specific head silhouette
  if (id === 'ton') {
    const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 14);
    const lEar = new THREE.Mesh(earGeo, hoodMat);
    lEar.rotation.z = Math.PI / 2;
    lEar.position.set(-0.5, 0.04, 0);
    const rEar = lEar.clone();
    rEar.position.set(0.5, 0.04, 0);
    headGroup.add(lEar, rEar);
  } else if (id === 'toso' || id === 'nita') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.62, 14), hoodMat);
    cone.position.set(0, 0.56, -0.02);
    cone.rotation.z = -0.14;
    headGroup.add(cone);
  } else if (id === 'tis') {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 10), hoodMat);
    horn.position.set(0.42, 0.34, 0);
    horn.rotation.z = -0.75;
    headGroup.add(horn);
  }

  // Cracked Latex Faceplate
  const facePlate = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 16), faceMat);
  facePlate.scale.set(0.95, 1.05, 0.58);
  facePlate.position.set(0, -0.02, 0.25);
  headGroup.add(facePlate);

  // Hollow Eye Pits & Glowing Pinpoint Pupils
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.9 });
  const socketGeo = new THREE.SphereGeometry(0.085, 12, 12);
  const lSocket = new THREE.Mesh(socketGeo, socketMat);
  lSocket.position.set(-0.14, 0.06, 0.44);
  const rSocket = lSocket.clone();
  rSocket.position.set(0.14, 0.06, 0.44);
  headGroup.add(lSocket, rSocket);

  const pupilGeo = new THREE.SphereGeometry(0.032, 10, 10);
  const lPupil = new THREE.Mesh(pupilGeo, eyeGlowMat);
  lPupil.position.set(-0.14, 0.06, 0.51);
  const rPupil = lPupil.clone();
  rPupil.position.set(0.14, 0.06, 0.51);
  headGroup.add(lPupil, rPupil);

  // Hinged Lower Jaw + Metal Teeth
  const jawGroup = new THREE.Group();
  jawGroup.name = 'jawGroup';
  jawGroup.position.set(0, -0.18, 0.28);
  const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.24), faceMat);
  jawMesh.position.set(0, -0.04, 0.06);
  jawGroup.add(jawMesh);

  for (let t = -2; t <= 2; t++) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), endoMat);
    tooth.position.set(t * 0.06, 0.04, 0.15);
    jawGroup.add(tooth);
  }
  headGroup.add(jawGroup);

  root.add(headGroup);
  return root;
}

export function Telechobi3DViewer({
  characterId,
  wireframeEndo,
  spotlightTint,
}: Telechobi3DViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.FogExp2(0x060608, 0.14);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 1.85, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (mandatory RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x18181b, 0.65);
    scene.add(hemiLight);

    const keyColor =
      spotlightTint === 'blood' ? 0xef4444 : spotlightTint === 'cold' ? 0x93c5fd : 0xfde68a;
    const keyLight = new THREE.DirectionalLight(keyColor, 2.4);
    keyLight.position.set(2.5, 4.2, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x64748b, 1.2);
    rimLight.position.set(-3, 2.5, -2.5);
    scene.add(rimLight);

    // Ground Pedestal & Contact Shadow
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.6, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75, metalness: 0.35 })
    );
    floor.position.y = -0.06;
    floor.receiveShadow = true;
    scene.add(floor);

    const model = buildCompositeTelechobi(characterId, wireframeEndo);
    scene.add(model);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.55, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.2;
    controls.maxDistance = 7.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      const head = model.getObjectByName('headGroup');
      const jaw = model.getObjectByName('jawGroup');
      if (head) {
        // Subtle eerie twitching
        const glitch = Math.sin(t * 7.3) > 0.96 ? 0.18 : 0;
        head.rotation.z = Math.sin(t * 0.9) * 0.06 + glitch;
        head.rotation.y = Math.sin(t * 0.6) * 0.14;
      }
      if (jaw) {
        jaw.rotation.x = 0.08 + Math.abs(Math.sin(t * 1.4)) * 0.12;
      }

      model.rotation.y += dt * 0.18;
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 640;
      const nh = container.clientHeight || 480;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [characterId, wireframeEndo, spotlightTint]);

  return <div ref={mountRef} className="w-full h-full" />;
}
