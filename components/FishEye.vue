<script setup lang="ts">
import { gsap } from 'gsap';
import { Environment, OrbitControls, Precipitation, RoundedBox } from '@tresjs/cientos';
import { TresCanvas } from '@tresjs/core';
import { EffectComposerPmndrs, FishEyePmndrs } from '@tresjs/post-processing';
import { BackSide, NoToneMapping } from 'three';
import { ref, watch } from 'vue';
import { BlendFunction } from 'postprocessing';

const gl = {
  clearColor: '#ffffff',
  toneMapping: NoToneMapping
};

const lensParams = { lensSX: 1.0, lensSY: 1.0, lensFX: 0.2, lensFY: 0.2 };

const tweenParams = {
  duration: 2,
  ease: 'elastic.out(0.85,0.3)'
};

const localBlendFunction = ref(BlendFunction.NORMAL);

const currentIndex = ref(0);
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs>
      <FishEyePmndrs
        :blendFunction="localBlendFunction"
        :lensS="[lensParams.lensSX, lensParams.lensSY]"
        :lensF="[lensParams.lensFX, lensParams.lensFY]"
        :scale="scale" />
    </EffectComposerPmndrs>
  </Suspense>
</template>
