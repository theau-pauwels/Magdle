import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";
import championsData from "../../data/champions.json";

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

  // 🎯 ADMIN DU JOUR (depuis Redis)
  const targetName = await redis.get(`daily:target:${date}`);
  const target = targetName
    ? championsData.find(c => c.name === targetName) ?? null
    : null;

  // 🏆 SCORES
  const scores = await redis.zRangeWithScores(
    `scores:${date}`,
    0,
    50
  );

  return new Response(
    JSON.stringify({
      date,
      target,
      scores,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
