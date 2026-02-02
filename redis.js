// redis.js
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

let pubClient;
let subClient;

export const initRedis = async () => {
  if (!pubClient) {
    pubClient = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    subClient = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    pubClient.on("connect", () => console.log("Redis Publisher Connected"));
    subClient.on("connect", () => console.log("Redis Subscriber Connected"));

    pubClient.on("error", (err) => console.log("Redis Pub Error:", err));
    subClient.on("error", (err) => console.log("Redis Sub Error:", err));

    await pubClient.connect();
    await subClient.connect();
  }

  return { pubClient, subClient };
};

export const getRedisAdapter = () => {
  if (!pubClient || !subClient) {
    throw new Error("Redis clients not initialized!");
  }
  return createAdapter(pubClient, subClient);
};


