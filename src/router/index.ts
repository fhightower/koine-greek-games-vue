import { createRouter, createWebHashHistory } from 'vue-router'

import DefiniteArticles1 from '../views/DefiniteArticles1.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/definite-articles-1',
      name: 'Definite Articles 1',
      component: DefiniteArticles1,
    },
  ],
})

export default router
