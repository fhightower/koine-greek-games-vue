<script setup lang="ts">
import { useRouter } from 'vue-router'
import { loadMisses } from '../utils/missLog'

const router = useRouter()
const games = router.getRoutes().filter(route => route.meta?.isGame)
const missCount = loadMisses().length
</script>

<template>
  <main class="home">
    <header class="masthead">
      <h1 class="wordmark">Κοινή</h1>
      <p class="tagline">Koine Greek practice</p>
    </header>

    <nav class="games" aria-label="Games">
      <router-link
        v-for="(route, i) in games"
        :key="route.path"
        :to="route.path"
        class="game"
        :style="{ animationDelay: `${0.15 + i * 0.08}s` }"
      >
        <span class="game__title">{{ route.meta.description || route.name }}</span>
        <span class="game__arrow" aria-hidden="true">→</span>
      </router-link>
    </nav>

    <footer class="home__foot">
      <router-link to="/review" class="review-link">
        Missed answers<span v-if="missCount"> ({{ missCount }})</span>
      </router-link>
    </footer>
  </main>
</template>

<style scoped>
.home {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(2.5rem, 9vh, 6rem) 0 4rem;
  text-align: center;
}

.masthead {
  margin-bottom: clamp(2rem, 6vh, 3.5rem);
}

.wordmark {
  margin: 0;
  font-size: clamp(4.5rem, 18vw, 7rem);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--app-text);
}

.tagline {
  margin: 0.4rem 0 0;
  font-size: 1.05rem;
  font-style: italic;
  letter-spacing: 0.08em;
  color: var(--app-muted);
}

/* hairline flourish under the masthead */
.masthead::after {
  content: '';
  display: block;
  width: 56px;
  height: 1px;
  margin: 1.4rem auto 0;
  background: var(--accent);
  opacity: 0.6;
}

.games {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  text-align: left;
}

.game {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.35rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  color: var(--app-text);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  box-shadow: 0 1px 2px rgba(43, 37, 32, 0.04);
  transition: transform 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease;

  opacity: 0;
  transform: translateY(8px);
  animation: rise 0.5s ease forwards;
}

.game:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.12);
  color: var(--app-text);
}

.game__arrow {
  color: var(--accent);
  font-size: 1.2rem;
  transition: transform 0.18s ease;
}
.game:hover .game__arrow {
  transform: translateX(4px);
}

.home__foot {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--app-line);
}

.review-link {
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  color: var(--app-muted);
  text-decoration: none;
}

.review-link:hover {
  color: var(--accent);
}

@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>
