import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

const getParisDateString = () => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const d = parts.find(p => p.type === "day")!.value;

  return `${y}-${m}-${d}`;
};

export const GET: APIRoute = async ({ request }) => {
  const redis = await getRedis();
  const url = new URL(request.url);

  const date = url.searchParams.get("date") ?? getParisDateString();

  /* 🎯 ADMIN DU JOUR (ID UNIQUEMENT) */
  const targetIdRaw = await redis.get(`daily:target:${date}`);
  const targetId = targetIdRaw ? Number(targetIdRaw) : null;

  /* 🏆 SCORES */
  const rawScores = await redis.zRangeWithScores(
    `scores:${date}`,
    0,
    50
  );

  const scores = rawScores.map(s => ({
    value: s.value,   // nom du joueur
    score: s.score,   // nombre d'essais
  }));

  return new Response(
    JSON.stringify({
      date,
      targetId,
      scores,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
