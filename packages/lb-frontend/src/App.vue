<script setup lang="ts">
import LeaderBoard from '@/components/leaderboard/LeaderBoard.vue';
</script>

<template>
  <header>
    <h1>模擬 Web Speed Hackathon リーダーボード</h1>
  </header>

  <main>
    <div>
      <LeaderBoard />
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
