<script setup lang="ts">
import RankingItem from '@/components/leaderboard/RankingItem.vue';
import RankingItemTop from '@/components/leaderboard/RankingItemTop.vue';

type RankingItemType = {
  rank: number;
  name: string;
  score: number;
  url: string;
  disqualified: boolean
}
const ranking: RankingItemType[] = [
  { rank: 1, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 2, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 3, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 4, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 5, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 6, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 7, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 8, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 9, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: false },
  { rank: 10, name: 'cp-20', score: 542.85, url: 'https://webspeedhackathon2024-cp20.koyeb.app/', disqualified: true },
]
</script>

<template>
  <div class="lb-container">
    <div class="top-3-container">
      <div v-for="i in [1, 0, 2]" :key="i">
        <RankingItemTop v-if="ranking.length > i" :rank="ranking[i].rank" :name="ranking[i].name"
          :score="ranking[i].score" :url="ranking[i].url" />
      </div>
    </div>
    <div class="top-3-container-sp">
      <div v-for="(item, i) in ranking.slice(0, 3)" :key="i">
        <RankingItem :rank="item.rank" :name="item.name" :score="item.score" :url="item.url" />
      </div>
    </div>
    <div class="rest-container">
      <div v-for="(item, i) in ranking.slice(3)" :key="i">
        <RankingItem :rank="item.rank" :name="item.name" :score="item.score" :url="item.url" />
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
