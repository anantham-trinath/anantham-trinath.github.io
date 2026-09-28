---
tags: [cache, redis]
date: 2026-09-26
---
# Caching Strategies

**Description:** Cache-aside, write-through, TTLs and the thundering herd.

A cache is a bet that the data you read now you'll read again soon. When the bet pays off, a 40 ms database query becomes a 0.5 ms Redis lookup.

## Cache-aside (lazy loading)

The application checks the cache first and fills it on a miss.

```ts
async function getUser(id: string) {
  const hit = await redis.get(`user:${id}`);
  if (hit) return JSON.parse(hit);
  const user = await db.users.findById(id);
  await redis.set(`user:${id}`, JSON.stringify(user), "EX", 300);
  return user;
}
```

## Choosing a strategy

| Strategy | Reads | Writes | Risk |
|---|---|---|---|
| Cache-aside | Fast after first miss | Go to DB | Stale until TTL |
| Write-through | Always warm | Slower | Caches data nobody reads |
| Write-back | Fast | Fastest | Data loss on crash |

> Stale data is a product decision, not just a technical one. Ask how stale is acceptable before picking a TTL.

## The thundering herd

When a hot key expires, thousands of requests miss at once and hit the database together.

- Add **jitter** to TTLs so keys don't expire together
- Use a **lock** so one request rebuilds while others wait
- Serve **stale-while-revalidate** for keys that can tolerate it
