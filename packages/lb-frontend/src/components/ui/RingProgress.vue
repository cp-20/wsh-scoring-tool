<script setup lang="ts">
type Props = {
  width: number;
  height: number;
  progress: number;
  color: string;
  text: string;
};

const props = defineProps<Props>();
</script>

<template>
  <svg :width="props.width" :height="props.height" viewBox="0 0 250 250" class="ring-progress">
    <circle class="background" />
    <circle class="progress-background" />
    <circle class="progress-foreground" />
    <text x="125" y="128">{{ props.text }}</text>
  </svg>
</template>

<style scoped>
.ring-progress {
  --progress: v-bind(progress);
  --size: 250px;
  --half-size: calc(var(--size) / 2);
  --stroke-width: 24px;
  --radius: calc((var(--size) - var(--stroke-width)) / 2);
  --circumference: calc(var(--radius) * pi * 2);
  --dash: calc((var(--progress) * var(--circumference)) / 100);
}

.background {
  cx: calc(var(--half-size));
  cy: calc(var(--half-size));
  r: calc(var(--radius) - var(--stroke-width) / 2);
  fill: v-bind(color);
  opacity: 0.1;
}

.progress-background,
.progress-foreground {
  cx: var(--half-size);
  cy: var(--half-size);
  r: var(--radius);
  stroke-width: var(--stroke-width);
  fill: none;
  stroke-linecap: round;
}

.progress-background {
  stroke: v-bind(color);
  opacity: 0.1;
}

.progress-foreground {
  transform: rotate(-90deg);
  transform-origin: var(--half-size) var(--half-size);
  stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
  transition: stroke-dasharray 0.3s linear 0s;
  stroke: v-bind(color);
}

text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 600;
  font-size: 48px;
  fill: v-bind(color);
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
