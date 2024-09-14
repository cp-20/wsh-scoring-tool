<script setup lang="ts">
import MdiExternalLink from '@/components/icons/MdiExternalLink.vue';
import MdiGithub from '@/components/icons/MdiGithub.vue';
import RankDisplay from '@/components/leaderboard/RankDisplay.vue';
import RingProgress from '@/components/ui/RingProgress.vue';
import { getRingColor, maxScore } from '@/lib/ring-color';
import { computed } from 'vue';

type Props = {
  rank: number;
  name: string;
  score: number;
  url: string;
};

const props = defineProps<Props>();
const ringColor = computed(() => getRingColor(props.score));
const progress = computed(() => props.score / maxScore * 100)
const scoreStr = computed(() => props.score.toFixed(2))
</script>

<template>
  <div class="container">
    <RankDisplay :rank="props.rank" />
    <img class="avatar-display" :src="`https://github.com/${props.name}.png?size=192`" width="192" height="192" alt="">
    <div class="label-container">
      <div class="rank">第{{ props.rank }}位</div>
      <div class="name">{{ props.name }}</div>
    </div>
    <div class="icons-container">
      <a :href="props.url" target="_blank" rel="noopener noreferrer">
        <MdiExternalLink />
      </a>
      <a :href="`https://github.com/${props.name}`" target="_blank" rel="noopener noreferrer">
        <MdiGithub />
      </a>
    </div>
    <RingProgress class="score-ring" :width="96" :height="96" :progress="progress" :color="ringColor"
      :text="scoreStr" />
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
