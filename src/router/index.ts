import { createRouter, createWebHashHistory } from 'vue-router'

import DefiniteArticles1 from '../views/DefiniteArticles1.vue'
import Home from '../views/Home.vue'
import SecondDeclensionFlashCards from '../views/SecondDeclensionFlashCards.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/definite-articles-1',
      name: 'Definite Articles 1',
      component: DefiniteArticles1,
      meta: { description: 'Definite Article Gender, Number, and Case Matching', isGame: true },
    },
    {
      path: '/second-declension-flash-cards',
      name: 'Second Declension Flash Cards',
      component: SecondDeclensionFlashCards,
      meta: { description: 'Second Declension Flash Cards', isGame: true },
    },
  ],
})

export default router
