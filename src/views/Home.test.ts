import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { recordMiss } from "../utils/missLog";
import Home from "./Home.vue";
import appRouter from "../router";

function makeRouter(routes: RouteRecordRaw[]) {
  return createRouter({ history: createWebHashHistory(), routes });
}

async function mountHome(routes?: RouteRecordRaw[]) {
  const router = routes ? makeRouter(routes) : appRouter;
  await router.push("/");
  await router.isReady();
  return mount(Home, { global: { plugins: [router] } });
}

function gameLinks(wrapper: Awaited<ReturnType<typeof mountHome>>) {
  return wrapper.findAll("a.game").map((link) => ({
    to: link.attributes("href"),
    label: link.get(".game__title").text(),
  }));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Home", () => {
  test("links to every route marked as a game, and to nothing else", async () => {
    const wrapper = await mountHome([
      { path: "/", name: "Home", component: Home },
      {
        path: "/played",
        name: "Played",
        component: Home,
        meta: { description: "A Game", isGame: true },
      },
      { path: "/review", name: "Review", component: Home, meta: { description: "Review" } },
    ]);

    expect(gameLinks(wrapper)).toEqual([{ to: "#/played", label: "A Game" }]);
  });

  test("names a game by its description, falling back to its route name", async () => {
    const wrapper = await mountHome([
      { path: "/", name: "Home", component: Home },
      { path: "/described", name: "Described", component: Home, meta: { description: "Parse This", isGame: true } },
      { path: "/bare", name: "Bare", component: Home, meta: { isGame: true } },
    ]);

    expect(gameLinks(wrapper).map((link) => link.label)).toEqual(["Parse This", "Bare"]);
  });

  test("offers every game the app ships", async () => {
    const wrapper = await mountHome();

    const games = appRouter.getRoutes().filter((route) => route.meta?.isGame);
    expect(games.length).toBeGreaterThan(0);
    expect(gameLinks(wrapper)).toHaveLength(games.length);
  });

  test("counts the missed answers waiting in review", async () => {
    expect((await mountHome()).get(".review-link").text()).toBe("Missed answers");

    recordMiss({
      gameId: "verb-voice",
      question: "λύεται",
      given: "Active",
      answer: "Passive",
      at: 1753363100000,
    });
    recordMiss({
      gameId: "prepositions",
      question: "ἐν",
      given: "accusative",
      answer: "dative",
      at: 1753363200000,
    });

    expect((await mountHome()).get(".review-link").text()).toBe("Missed answers (2)");
  });
});
