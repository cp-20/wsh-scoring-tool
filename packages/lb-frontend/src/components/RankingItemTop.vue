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
};

const props = defineProps<Props>();
const rankColor = computed(() => {
  if (props.rank === 1) return 'linear-gradient(220.55deg, #FFD439 0%, #FF7A00 100%)';
  if (props.rank === 2) return 'linear-gradient(220.55deg, #EAEAEA 0%, #8B8B8B 100%)';
  if (props.rank === 3) return 'linear-gradient(220.55deg, #FADD76 0%, #9F3311 100%)';
  return 'gray';
});
const ringColor = computed(() => getRingColor(props.score));
const progress = computed(() => props.score / maxScore * 100)
</script>

<template>
  <div class="container">
    <div class="rank-display">{{ props.rank }}</div>
    <img class="avatar-display" :src="`https://github.com/${props.name}.png?size=192`" width="192" height="192" alt="">
    <div class="label-container">
      <div class="rank">第{{ props.rank }}位</div>
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
    <RingProgress class="score-ring" :width="96" :height="96" :progress="progress" :color="ringColor"
      :text="`${props.score}`" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -2px rgba(0, 0, 0, .1);
  border-radius: 6px;
  gap: 1rem;
  padding: 1rem;
}

.rank-display {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 600;
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: v-bind(rankColor);
}

.avatar-display {
  border-radius: 50%;
}

.label-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label-container .rank {
  font-weight: 600;
}

.label-container .name {
  font-size: 1.4rem;
  font-weight: 600;
}

label-container .name-display {
  font-size: 1.5rem;
}

.icons-container {
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.icons-container a {
  color: inherit;
  padding: 0.125rem;
  width: 1em;
  height: 1em;
}

.score-ring {
  margin-top: 1rem;
}
</style>
