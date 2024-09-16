<script setup lang="ts">
import { getRankColor } from '@/lib/rank-color';
import { computed } from 'vue';

type Props = {
  rank: number;
};
const props = defineProps<Props>();
const rankColor = computed(() => getRankColor(props.rank));
</script>

<template>
  <div class="rank-display">{{ props.rank }}</div>
</template>

<style scoped>
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
</style>
