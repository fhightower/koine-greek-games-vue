import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import DefiniteArticles1 from '../views/DefiniteArticles1.vue'
import FirstDeclensionFlashCards from '../views/FirstDeclensionFlashCards.vue'
import Home from '../views/Home.vue'
import SecondDeclensionFlashCards from '../views/SecondDeclensionFlashCards.vue'
import TranslationGame from '../components/TranslationGame.vue'
import VerbEndingsLuo from '../views/VerbEndingsLuo.vue'
import VerbEndingsLuoActive from '../views/VerbEndingsLuoActive.vue'
import VerbVoice from '../views/VerbVoice.vue'
import AdjectiveAgathos from '../views/AdjectiveAgathos.vue'
import Prepositions from '../views/Prepositions.vue'
import EimiForms from '../views/EimiForms.vue'
import Demonstratives from '../views/Demonstratives.vue'
import { translationLessons } from '../data/translationGames'

// One translation game per Machen lesson with a Greek Exercise I section.
const translationRoutes: RouteRecordRaw[] = translationLessons.map(lesson => ({
  path: `/translate/${lesson.slug}`,
  name: lesson.title,
  component: TranslationGame,
  props: { gameId: lesson.gameId, title: lesson.title, sentences: lesson.sentences },
  meta: { description: `${lesson.title} — Translate the Greek`, isGame: true },
}))

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
    {
      path: '/first-declension-flash-cards',
      name: 'First Declension Flash Cards',
      component: FirstDeclensionFlashCards,
      meta: { description: 'First Declension Flash Cards', isGame: true },
    },
    {
      path: '/verb-voice',
      name: 'Verb Voice',
      component: VerbVoice,
      meta: { description: 'Active, Middle, or Passive?', isGame: true },
    },
    {
      path: '/luo-active-endings',
      name: 'Luo Active Endings',
      component: VerbEndingsLuoActive,
      meta: { description: 'λύω Present Active Endings', isGame: true },
    },
    {
      path: '/adjective-agathos',
      name: 'Adjective Agreement',
      component: AdjectiveAgathos,
      meta: { description: 'ἀγαθός Adjective Forms', isGame: true },
    },
    {
      path: '/prepositions',
      name: 'Prepositions',
      component: Prepositions,
      meta: { description: 'Prepositions and Their Cases', isGame: true },
    },
    {
      path: '/eimi-forms',
      name: 'Eimi Forms',
      component: EimiForms,
      meta: { description: 'εἰμί Present Indicative', isGame: true },
    },
    {
      path: '/demonstratives',
      name: 'Demonstratives',
      component: Demonstratives,
      meta: { description: 'οὗτος and ἐκεῖνος Forms', isGame: true },
    },
    {
      path: '/luo-endings',
      name: 'Luo Endings',
      component: VerbEndingsLuo,
      meta: { description: 'λύω Middle/Passive Endings', isGame: true },
    },
    ...translationRoutes,
  ],
})

export default router
