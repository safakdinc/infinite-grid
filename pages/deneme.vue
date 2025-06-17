<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera ref="camera" />
    <OrbitControls />
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

const cameraZ = ref(5);

const camera = ref<THREE.PerspectiveCamera | null>(null);

function setMeshRef(element: THREE.Mesh) {
  console.log('Mesh reference set:', element);
  meshes.value.push(element);
}

onMounted(() => {
  window.addEventListener('mousedown', () => {
    camera.value?.position.set(0, 0, 10);
  });

  window.addEventListener('mouseup', () => {
    camera.value?.position.set(0, 0, cameraZ.value);
  });
});
</script>
