<script setup lang="ts">
import RankingItemTop from '@/components/RankingItemTop.vue';
import RankingItem from '@/components/RankingItem.vue';
</script>

<template>
  <header>
    <h1>模擬 Web Speed Hackathon リーダーボード</h1>
  </header>

  <main>
    <div>
      <div class="top-3-container">
        <div v-for="i in [2, 1, 3]" :key="i">
          <RankingItemTop :rank="i" name="cp-20" :score="542.85" url="https://webspeedhackathon2024-cp20.koyeb.app/" />
        </div>
      </div>
      <div class="rest-container">
        <div v-for="i in [4, 5, 6, 6, 7, 8, 9, 10]" :key="i">
          <RankingItem :rank="i" name="cp-20" :score="542.85" url="https://webspeedhackathon2024-cp20.koyeb.app/" />
        </div>
      </div>
    </div>
  </main>

  <footer>
    <p>模擬 Web Speed Hackathon リーダーボード</p>
  </footer>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
}

.top-3-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rest-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

footer {
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid #ccc;
}

footer p {
  text-align: center;
  color: #777;
}
</style>
