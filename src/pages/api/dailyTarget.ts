import type { APIRoute } from "astro";
import championsData from "../../data/champions.json";
import { getRedis } from "../../lib/redis";
import { getParisDateString } from "../../utils";

const getWeight = (daysSinceLastPick: number | null) => {
  if (daysSinceLastPick === null) return 1;        // jamais choisi
  return Math.max(0.05, Math.min(1, daysSinceLastPick / 10));
};

function pickWeighted(
  champions: typeof championsData,
  weights: number[]
) {
  const total = weights.reduce((a, b) => a + b, 0);
  let rnd = Math.random() * total;

  for (let i = 0; i < champions.length; i++) {
    rnd -= weights[i];
    if (rnd <= 0) return champions[i];
  }

  return champions[champions.length - 1];
}



export const GET: APIRoute = async () => {
  const redis = await getRedis();
  const today = getParisDateString();

  const dailyKey = `daily:target:${today}`;

  // 1️⃣ Déjà calculé ?
  const existing = await redis.get(dailyKey);
  if (existing) {
    return new Response(JSON.stringify({ name: existing }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2️⃣ Calcul pondéré
  const weights = [];

  for (const c of championsData) {
    const last = await redis.get(`daily:lastPicked:${c.id}`);
    if (!last) {
      weights.push(1);
    } else {
      const diffDays =
        (new Date(today).getTime() - new Date(last).getTime()) /
        (1000 * 60 * 60 * 24);
      weights.push(getWeight(Math.floor(diffDays)));
    }
  }

  const selected = pickWeighted(championsData, weights);

  // 3️⃣ Sauvegarde
  await redis.set(dailyKey, selected.id);
  await redis.set(`daily:lastPicked:${selected.id}`, today);

  return new Response(JSON.stringify({ id: selected.id }), {
    headers: { "Content-Type": "application/json" },
  });
};
