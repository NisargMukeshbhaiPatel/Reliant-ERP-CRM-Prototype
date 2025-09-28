import PocketBase from "pocketbase";
import { LRUCache } from 'lru-cache';

export const createPB = (() => {
  const pb = new PocketBase(
    "https://pb-reliant-proto.fly.dev/"
  );
  pb.autoCancellation(false);
  return pb;
});

export const globalPB = createPB();

const options = {
  ttl: 1000 * 60 * 30, // 30 minutes
  ttlAutopurge: true
};

export const pbUserCache = new LRUCache(options);
