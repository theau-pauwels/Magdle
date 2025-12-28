// src/pages/api/reset-today.ts
import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

const getParisDateString = () => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(new Date());

  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const d = parts.find(p => p.type === "day")!.value;

  return `${y}-${m}-${d}`;
};

export const POST: APIRoute = async () => {
  const redis = await getRedis();
  const today = getParisDateString();

  await redis.del(`scores:${today}`);

  return new Response(
    JSON.stringify({ ok: true, deleted: `scores:${today}` }),
    { headers: { "Content-Type": "application/json" } }
  );
};
