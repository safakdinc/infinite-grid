<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera ref="camera" />
    <TresMesh :ref="el => setMeshRef(el)">
      <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
      <TresMeshBasicMaterial color="orange" />
    </TresMesh>
  </TresCanvas>
</template>
<script setup lang="ts">
import { Box, OrbitControls } from '@tresjs/cientos';
import * as THREE from 'three';
import gsap from 'gsap';

const meshes = ref<THREE.Mesh[]>([]);

const camera = ref<THREE.PerspectiveCamera | null>(null);

function setMeshRef(element: THREE.Mesh) {
  console.log('Mesh reference set:', element);
  meshes.value.push(element);
}

onMounted(() => {
  window.addEventListener('mousedown', () => {
    gsap.to(camera.value?.position, {
      z: 10,
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  window.addEventListener('mouseup', () => {
    gsap.to(camera.value?.position, {
      z: 2,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});
</script>
