<script setup lang="ts">
import MdiExternalLink from '@/components/icons/MdiExternalLink.vue';
import MdiGithub from '@/components/icons/MdiGithub.vue';
import RingProgress from '@/components/RingProgress.vue';
import { getRingColor, maxScore } from '@/lib/ring-color';
import { computed } from 'vue';

type Props = {
  rank: number;
  name: string;
  score: number;
  url: string;
  disqualified?: boolean;
};

const props = defineProps<Props>();
const ringColor = computed(() => getRingColor(props.score));
const progress = computed(() => props.score / maxScore * 100)
</script>

<template>
  <div class="container" :class="{ disqualified: !!disqualified }">
    <img class="avatar-display" :src="`https://github.com/${props.name}.png?size=96`" width="96" height="96" alt="">
    <div>
      <div class="label-container">
        <div class="rank" v-if="!props.disqualified">第{{ props.rank }}位</div>
        <div class="annotation" v-if="!!props.disqualified">レギュレーション違反</div>
        <div class="name">{{ props.name }}</div>
      </div>
      <div class="icons-container">
        <a :href="props.url" target="_blank" rel="noopener noreferrer">
          <MdiExternalLink />
        </a>
        <a :href="props.url" target="_blank" rel="noopener noreferrer">
          <MdiGithub />
        </a>
      </div>
    </div>
    <RingProgress class="score-ring" :width="64" :height="64" :progress="progress" :color="ringColor"
      :text="`${props.score}`" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -2px rgba(0, 0, 0, .1);
  border-radius: 6px;
  padding: 1rem;
}

.container.disqualified {
  background-color: #eee;
  color: #444;
}

.avatar-display {
  border-radius: 50%;
}

.label-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label-container .rank {
  font-weight: 600;
}

.label-container .name {
  font-size: 1.25rem;
  font-weight: 600;
}

.icons-container {
  display: flex;
  gap: 0.25rem;
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.icons-container a {
  color: inherit;
  width: 1em;
  height: 1em;
}

.score-ring {
  margin-left: auto;
}
</style>
