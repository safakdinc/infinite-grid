<template>
  <div class="infinite-grid-container">
    <div class="vignette-overlay"></div>
    <TresCanvas v-bind="gl" ref="canvasRef" :outputColorSpace="'srgb'">
      <TresPerspectiveCamera ref="cameraRef" :position="[0, 0, cameraZ]" :fov="45" :aspect="aspectRatio" :near="1" :far="1000" />

      <TresGroup
        v-for="(group, index) in tileGroups"
        :key="index"
        :position="[group.pos[0] + scroll.current.x + group.offset.x, group.pos[1] + scroll.current.y + group.offset.y, group.pos[2]]"
        :ref="el => setGroupRef(el, index)">
        <TresGroup
          v-for="(tile, tileIndex) in tiles"
          :key="tileIndex"
          :position="tile.pos"
          @pointer-enter="handleTilePointerEnter(index, tileIndex)"
          @pointer-leave="handleTilePointerLeave(index, tileIndex)"
          @click="handleTileClick(index, tileIndex)">
          <TresMesh :position="[0, 0, 0]" :ref="el => setBackgroundMeshRef(el, getTileKey(index, tileIndex))">
            <TresPlaneGeometry :args="[TILE_SIZE, TILE_SIZE]" />
            <TresShaderMaterial
              v-if="cardTextures.length > 0"
              :vertex-shader="gaussianBlurVertexShader"
              :fragment-shader="gaussianBlurFragmentShader"
              :uniforms="getStaticBackgroundUniforms(index, tileIndex)"
              :transparent="true" />
          </TresMesh>

          <TresMesh :position="[0, 0, 0]" :ref="el => setForegroundMeshRef(el, getTileKey(index, tileIndex))">
            <TresPlaneGeometry :args="[TILE_SIZE, TILE_SIZE]" />
            <TresMeshBasicMaterial v-if="cardTextures.length > 0" :map="getCardForegroundTexture(index, tileIndex)" :transparent="true" />
          </TresMesh>
        </TresGroup>
      </TresGroup>

      <Suspense>
        <FishEye></FishEye>
      </Suspense>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { useDevicePixelRatio, useWindowSize, usePreferredReducedMotion, useMediaQuery } from '@vueuse/core';
import { CanvasTexture, Mesh, Object3D, UniformsUtils, ShaderMaterial } from 'three';
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRenderLoop, type TresObject } from '@tresjs/core';
import gsap from 'gsap';
import { generateForegroundTexture, generateBackgroundTexture } from '@/utils/createTexture';

import gaussianBlurVertexShader from '@/shaders/gaussianBlurVertex.glsl?raw';
import gaussianBlurFragmentShader from '@/shaders/gaussianBlurFragment.glsl?raw';

interface CardData {
  title: string;
  badge: string;
  description: string;
  tags: string[];
  date: string;
  imageUrl?: string;
}

interface Options {
  gridCols?: number;
  gridRows?: number;
  gridGap?: number;
  tileSize?: number;
  baseCameraZ?: number;
}

interface Props {
  cardData: CardData[];
  options?: Options;
}

const defaultOptions: Required<Options> = {
  gridCols: 3,
  gridRows: 3,
  gridGap: 0,
  tileSize: 3,
  baseCameraZ: 10
};

const props = withDefaults(defineProps<Props>(), {
  cardData: () => [],
  options: () => ({})
});

const mergedOptions = computed<Required<Options>>(() => ({
  ...defaultOptions,
  ...props.options
}));

// Derive constants from mergedOptions
const GRID_GAP = computed(() => mergedOptions.value.gridGap);
const TILE_SIZE = computed(() => mergedOptions.value.tileSize);
const TILE_SPACE = computed(() => TILE_SIZE.value + GRID_GAP.value);
const GRID_COLS = computed(() => mergedOptions.value.gridCols);
const GRID_ROWS = computed(() => mergedOptions.value.gridRows);
const GRID_WIDTH = computed(() => TILE_SPACE.value * GRID_COLS.value);
const GRID_HEIGHT = computed(() => TILE_SPACE.value * GRID_ROWS.value);
const TOTAL_GRID_WIDTH = computed(() => GRID_WIDTH.value * 3);
const TOTAL_GRID_HEIGHT = computed(() => GRID_HEIGHT.value * 3);

const { width, height } = useWindowSize();
const { onLoop } = useRenderLoop();

const canvasRef = ref();
const cameraRef = ref<TresObject | null>(null);
const groupRefs = ref<Object3D[]>([]);
const foregroundMeshRefs = ref<Map<string, Mesh>>(new Map());
const backgroundMeshRefs = ref<Map<string, Mesh>>(new Map());

interface CardTextureSet {
  foreground: CanvasTexture;
  background: CanvasTexture | null;
}

const cardTextures = ref<CardTextureSet[]>([]);
const currentHoveredTileKey = ref<string | null>(null);

// Store static uniforms to prevent re-creation
const staticUniforms = ref<Map<string, any>>(new Map());

// GSAP Animation Configuration
const hoverTransitionDuration = 0.6;
const hoverEase = 'power2.out';

// Camera and viewport
const aspectRatio = computed(() => width.value / height.value);
const cameraZ = ref(mergedOptions.value.baseCameraZ);
const targetCameraZ = ref(mergedOptions.value.baseCameraZ);

// Scroll system
const scroll = reactive({
  ease: 1.2,
  scale: 0.012,
  current: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  last: { x: 0, y: 0 }
});

// Direction tracking
const direction = reactive({ x: 1, y: 1 });

// Interaction state
const isDown = ref(false);
const startPosition = reactive({ x: 0, y: 0 });
const scrollPosition = reactive({ x: 0, y: 0 });

// Viewport in world units
const viewport = computed(() => {
  const fov = 45 * (Math.PI / 180);
  const viewHeight = 2 * Math.tan(fov / 2) * cameraZ.value;
  return { width: viewHeight * aspectRatio.value, height: viewHeight };
});

// Dynamically generated tiles
const tiles = computed(() => {
  const generatedTiles = [];
  const startX = -((GRID_COLS.value - 1) / 2) * TILE_SPACE.value;
  const startY = ((GRID_ROWS.value - 1) / 2) * TILE_SPACE.value;

  for (let row = 0; row < GRID_ROWS.value; row++) {
    for (let col = 0; col < GRID_COLS.value; col++) {
      const x = startX + col * TILE_SPACE.value;
      const y = startY - row * TILE_SPACE.value;
      generatedTiles.push({ pos: [x, y, 0] as [number, number, number] });
    }
  }
  return generatedTiles;
});

const tileGroups = ref<Array<{ pos: [number, number, number]; offset: { x: number; y: number } }>>([]);

function initializeTileGroups() {
  const groups = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      groups.push({
        pos: [GRID_WIDTH.value * c, GRID_HEIGHT.value * r, 0],
        offset: { x: 0, y: 0 }
      });
    }
  }
  tileGroups.value = groups;
}

// WebGL rendering config
const gl = {
  antialias: true,
  alpha: true,
  clearColor: '#000000'
};

// Performance optimization state
const isScrolling = ref(false);
const scrollTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const hoverDebounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const initialBackgroundOpacity = 0.0;
const hoveredBackgroundOpacity = 1.0;

// Helper functions
function lerp(start: number, end: number, amount: number): number {
  return start * (1 - amount) + end * amount;
}

function setGroupRef(el: any, index: number) {
  if (el) {
    groupRefs.value[index] = el.parent;
  }
}

function setForegroundMeshRef(el: any, key: string) {
  if (el) {
    foregroundMeshRefs.value.set(key, el.parent);
  }
}

function setBackgroundMeshRef(el: any, key: string) {
  if (el) {
    const meshInstance = el as Mesh;
    backgroundMeshRefs.value.set(key, meshInstance);

    // Initialize the uOpacity uniform once the mesh is created
    if (meshInstance.material instanceof ShaderMaterial && meshInstance.material.uniforms) {
      if (!meshInstance.material.uniforms.uOpacity) {
        meshInstance.material.uniforms.uOpacity = { value: initialBackgroundOpacity };
      }
    }
  }
}

function getTileKey(groupIndex: number, tileIndex: number): string {
  return `${groupIndex}-${tileIndex}`;
}

// Updated texture indexing
function getCardTextureIndex(groupIndex: number, tileIndex: number): number {
  const tilesPerGroup = GRID_COLS.value * GRID_ROWS.value;
  return (groupIndex * tilesPerGroup + tileIndex) % props.cardData.length;
}

function getCardForegroundTexture(groupIndex: number, tileIndex: number) {
  if (cardTextures.value.length === 0) return null;
  const textureIndex = getCardTextureIndex(groupIndex, tileIndex);
  return cardTextures.value[textureIndex].foreground;
}

function getCardBackgroundTexture(groupIndex: number, tileIndex: number) {
  if (cardTextures.value.length === 0) return null;
  const textureIndex = getCardTextureIndex(groupIndex, tileIndex);
  return cardTextures.value[textureIndex].background;
}

function getStaticBackgroundUniforms(groupIndex: number, tileIndex: number) {
  const tileKey = getTileKey(groupIndex, tileIndex);

  // Return cached uniforms if they exist
  if (staticUniforms.value.has(tileKey)) {
    return staticUniforms.value.get(tileKey);
  }

  const texture = getCardBackgroundTexture(groupIndex, tileIndex);

  let uniforms;
  if (!texture) {
    uniforms = {
      map: { value: null },
      resolution: { value: [1.0, 1.0] },
      uOpacity: { value: initialBackgroundOpacity }
    };
  } else {
    const texWidth = texture.image?.width || 512;
    const texHeight = texture.image?.height || 512;

    uniforms = {
      map: { value: texture },
      resolution: { value: [texWidth, texHeight] },
      uOpacity: { value: initialBackgroundOpacity }
    };
  }

  staticUniforms.value.set(tileKey, uniforms);
  return uniforms;
}

// Position update logic
function updatePositions() {
  const scrollX = scroll.current.x;
  const scrollY = scroll.current.y;

  tileGroups.value.forEach((group, i) => {
    const posX = group.pos[0] + scrollX + group.offset.x;
    const posY = group.pos[1] + scrollY + group.offset.y;
    const dir = direction;
    const groupOffX = GRID_WIDTH.value / 2;
    const groupOffY = GRID_HEIGHT.value / 2;
    const viewportOff = {
      x: viewport.value.width / 2,
      y: viewport.value.height / 2
    };

    // Infinite scroll logic
    if (dir.x < 0 && posX - groupOffX > viewportOff.x) {
      group.offset.x -= TOTAL_GRID_WIDTH.value;
    } else if (dir.x > 0 && posX + groupOffX < -viewportOff.x) {
      group.offset.x += TOTAL_GRID_WIDTH.value;
    }

    if (dir.y < 0 && posY - groupOffY > viewportOff.y) {
      group.offset.y -= TOTAL_GRID_HEIGHT.value;
    } else if (dir.y > 0 && posY + groupOffY < -viewportOff.y) {
      group.offset.y += TOTAL_GRID_HEIGHT.value;
    }
  });
}

// Mouse/Touch event handlers
function onPointerDown(e: MouseEvent | TouchEvent) {
  currentHoveredTileKey.value = null;
  isDown.value = true;
  scrollPosition.x = scroll.current.x;
  scrollPosition.y = scroll.current.y;

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

  startPosition.x = clientX;
  startPosition.y = clientY;

  targetCameraZ.value = mergedOptions.value.baseCameraZ * 1.3;
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!isDown.value) return;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

  const distanceX = (startPosition.x - clientX) * scroll.scale;
  const distanceY = (startPosition.y - clientY) * scroll.scale;

  scroll.target.x = scrollPosition.x - distanceX;
  scroll.target.y = scrollPosition.y + distanceY;
}

function onPointerUp() {
  isDown.value = false;
  targetCameraZ.value = mergedOptions.value.baseCameraZ;
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  scroll.target.x -= e.deltaX * scroll.scale;
  scroll.target.y += e.deltaY * scroll.scale;

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false;
  }, 150);
}

// Hover event handlers
function handleTilePointerEnter(groupIndex: number, tileIndex: number) {
  if (isDown.value) return;

  const newTileKey = getTileKey(groupIndex, tileIndex);
  if (currentHoveredTileKey.value === newTileKey) {
    return;
  }
  currentHoveredTileKey.value = newTileKey;
}

function handleTilePointerLeave(groupIndex: number, tileIndex: number) {
  if (isDown.value) return;

  const leavingTileKey = getTileKey(groupIndex, tileIndex);
  if (currentHoveredTileKey.value === leavingTileKey) {
    currentHoveredTileKey.value = null;
  }
}

watch(currentHoveredTileKey, (newTileKey, oldTileKey) => {
  // Animate out the old tile
  if (oldTileKey) {
    const oldMesh = backgroundMeshRefs.value.get(oldTileKey);
    if (oldMesh && oldMesh.material instanceof ShaderMaterial && oldMesh.material.uniforms && oldMesh.material.uniforms.uOpacity) {
      gsap.to(oldMesh.material.uniforms.uOpacity, {
        value: initialBackgroundOpacity,
        duration: hoverTransitionDuration,
        ease: hoverEase,
        overwrite: true,
        onComplete: () => {
          console.log(`Animated out: ${oldTileKey}`);
        }
      });
    }
  }

  // Animate in the new tile
  if (newTileKey) {
    const newMesh = backgroundMeshRefs.value.get(newTileKey);
    if (newMesh && newMesh.material instanceof ShaderMaterial && newMesh.material.uniforms && newMesh.material.uniforms.uOpacity) {
      gsap.to(newMesh.material.uniforms.uOpacity, {
        value: hoveredBackgroundOpacity,
        duration: hoverTransitionDuration,
        ease: hoverEase,
        overwrite: true,
        onComplete: () => {
          console.log(`Animated in: ${newTileKey}`);
        }
      });
    }
  }
});

function handleTileClick(groupIndex: number, tileIndex: number) {
  if (isScrolling.value || isDown.value) return;
  console.log(`Tile Clicked: Group ${groupIndex}, Tile ${tileIndex}`);
}

// Animation loop
onLoop(() => {
  scroll.current.x = lerp(scroll.current.x, scroll.target.x, scroll.ease);
  scroll.current.y = lerp(scroll.current.y, scroll.target.y, scroll.ease);

  cameraZ.value = lerp(cameraZ.value, targetCameraZ.value, 0.1);
  if (cameraRef.value?.instance) {
    cameraRef.value.instance.position.z = cameraZ.value;
  }

  if (scroll.current.y > scroll.last.y) {
    direction.y = -1;
  } else if (scroll.current.y < scroll.last.y) {
    direction.y = 1;
  }

  if (scroll.current.x > scroll.last.x) {
    direction.x = -1;
  } else if (scroll.current.x < scroll.last.x) {
    direction.x = 1;
  }

  updatePositions();

  scroll.last.x = scroll.current.x;
  scroll.last.y = scroll.current.y;
});

// Texture generation
async function generateTexturesForCardData(data: CardData[]) {
  if (data.length === 0) {
    cardTextures.value = [];
    return;
  }

  const texturePromises = data.map(async card => {
    const foreground = await generateForegroundTexture(card);
    let background: CanvasTexture | null = null;
    background = await generateBackgroundTexture(card);
    return { foreground, background };
  });

  const loadedTextures = await Promise.all(texturePromises);
  cardTextures.value = loadedTextures;
}

// Lifecycle hooks
onMounted(async () => {
  cameraZ.value = mergedOptions.value.baseCameraZ;
  targetCameraZ.value = mergedOptions.value.baseCameraZ;

  initializeTileGroups();
  await generateTexturesForCardData(props.cardData);

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('mousedown', onPointerDown);
  window.removeEventListener('mousemove', onPointerMove);
  window.removeEventListener('mouseup', onPointerUp);
  window.removeEventListener('touchstart', onPointerDown);
  window.removeEventListener('touchmove', onPointerMove);
  window.removeEventListener('touchend', onPointerUp);

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
  if (hoverDebounceTimeout.value) {
    clearTimeout(hoverDebounceTimeout.value);
  }

  cardTextures.value.forEach(set => {
    set.foreground.dispose();
    set.background?.dispose();
  });

  // Clear cached uniforms
  staticUniforms.value.clear();
});

// Watch for changes in cardData or options prop and regenerate textures/grid
watch(
  () => [props.cardData, props.options],
  async ([newCardData, newOptions]) => {
    await generateTexturesForCardData(newCardData as CardData[]);

    // Reset scroll and camera
    scroll.current = { x: 0, y: 0 };
    scroll.target = { x: 0, y: 0 };
    scroll.last = { x: 0, y: 0 };
    cameraZ.value = mergedOptions.value.baseCameraZ;
    targetCameraZ.value = mergedOptions.value.baseCameraZ;

    // Clear existing refs and cached uniforms
    groupRefs.value = [];
    foregroundMeshRefs.value.clear();
    backgroundMeshRefs.value.clear();
    staticUniforms.value.clear();
  },
  { deep: true }
);
</script>

<style scoped>
.infinite-grid-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
}

:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.vignette-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.8) 90%, rgba(0, 0, 0, 1) 100%);
}
</style>
