import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { playerId, score } = await request.json();

    if (!playerId || score == null) {
      return new Response(
        JSON.stringify({ error: "Missing data" }),
        { status: 400 }
      );
    }

    const redis = await getRedis();
    const today = new Date().toISOString().slice(0, 10);
    const key = `score:${playerId}:${today}`;

    const exists = await redis.exists(key);
    if (exists) {
      return new Response(
        JSON.stringify({ error: "Already submitted today" }),
        { status: 403 }
      );
    }

    await redis.set(key, score, { EX: 86400 });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error("API ERROR", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
