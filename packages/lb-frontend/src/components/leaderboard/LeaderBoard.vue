<script setup lang="ts">
import RankingItem from '@/components/leaderboard/RankingItem.vue';
import RankingItemTop from '@/components/leaderboard/RankingItemTop.vue';
import { getRanking } from '@/lib/gateway';
import type { RankingItemType } from '@/lib/gateway';
import { ref } from 'vue';

const ranking = ref<RankingItemType[]>([]);
const disqualified = ref<RankingItemType[]>([]);

getRanking().then((data) => {
  if (data === null) return;
  ranking.value = data.filter((i) => !i.disqualified);
  disqualified.value = data.filter((i) => i.disqualified);
});
</script>

<template>
  <div class="lb-container">
    <div class="top-3-container">
      <div v-for="i in [1, 0, 2]" :key="i">
        <RankingItemTop
          v-if="ranking.length > i"
          :rank="ranking[i].rank"
          :name="ranking[i].name"
          :score="ranking[i].score"
          :url="ranking[i].url"
        />
        <div v-if="ranking.length <= i" />
      </div>
    </div>
    <div class="top-3-container-sp">
      <div v-for="(item, i) in ranking.slice(0, 3)" :key="i">
        <RankingItem :rank="item.rank" :name="item.name" :score="item.score" :url="item.url" />
      </div>
    </div>
    <div class="rest-container">
      <div v-for="(item, i) in ranking.slice(3).concat(disqualified)" :key="i">
        <RankingItem
          :rank="item.rank"
          :name="item.name"
          :score="item.score"
          :url="item.url"
          :disqualified="item.disqualified"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lb-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.top-3-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.top-3-container-sp {
  display: none;
}

@media screen and (max-width: 840px) {
  .top-3-container {
    display: none;
  }

  .top-3-container-sp {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

.rest-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
