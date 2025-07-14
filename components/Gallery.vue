<template>
  <div ref="infiniteGridContainer" class="infinite-grid-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { InfiniteGridClass } from '@/utils/InfiniteGridClass';

// Define interfaces for props
export interface CardData {
  title: string;
  badge: string;
  description?: string; // Made optional since some cards might not have descriptions
  tags: string[];
  date: string;
  image?: string; // Changed from imageUrl to image to match your data structure
}

interface PostProcessParameters {
  distortionIntensity?: number; // New: single scalar for distortion control
  vignetteOffset?: number;
  vignetteDarkness?: number;
}

interface GridOptions {
  gridCols?: number;
  gridRows?: number;
  gridGap?: number;
  tileSize?: number;
  baseCameraZ?: number;
  enablePostProcessing?: boolean;
  postProcessParams?: PostProcessParameters;
}

interface Props {
  cardData: CardData[];
  options?: GridOptions;
}

const props = withDefaults(defineProps<Props>(), {
  cardData: () => [],
  options: () => ({
    enablePostProcessing: true,
    postProcessParams: {
      distortionIntensity: 0.0, // Default to no distortion initially
      vignetteOffset: 0.8, // Start vignette at 80% from center
      vignetteDarkness: 1.2 // Smooth transition to darkness
    }
  })
});

const emit = defineEmits(['tileClicked']);

const infiniteGridContainer = ref<HTMLElement | null>(null);
let infiniteGridInstance: InfiniteGridClass | null = null;

function handleTileClicked(event: Event) {
  const customEvent = event as CustomEvent;
  emit('tileClicked', customEvent.detail);
}

onMounted(async () => {
  if (infiniteGridContainer.value) {
    infiniteGridInstance = new InfiniteGridClass(infiniteGridContainer.value, props.cardData, props.options);
    await infiniteGridInstance.init();

    infiniteGridContainer.value.addEventListener('tileClicked', handleTileClicked);
  }
});

onBeforeUnmount(() => {
  if (infiniteGridInstance) {
    if (infiniteGridContainer.value) {
      infiniteGridContainer.value.removeEventListener('tileClicked', handleTileClicked);
    }
    infiniteGridInstance.dispose();
    infiniteGridInstance = null;
  }
});

watch(
  () => [props.cardData, props.options],
  async ([newCardData, newOptions]) => {
    if (infiniteGridInstance) {
      infiniteGridInstance.dispose();
      infiniteGridInstance = null;
    }

    if (infiniteGridContainer.value) {
      infiniteGridInstance = new InfiniteGridClass(infiniteGridContainer.value, newCardData as CardData[], newOptions as GridOptions);
      await infiniteGridInstance.init();
      infiniteGridContainer.value.addEventListener('tileClicked', handleTileClicked);
    }
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

.infinite-grid-container > canvas {
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
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0.8) 90%, rgba(0, 0, 0, 1) 100%);
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 15;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
  mask-image: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.8) 90%, rgba(0, 0, 0, 1) 100%);
  -webkit-mask-image: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(0, 0, 0, 0.5) 70%,
    rgba(0, 0, 0, 0.8) 90%,
    rgba(0, 0, 0, 1) 100%
  );
}
</style>
