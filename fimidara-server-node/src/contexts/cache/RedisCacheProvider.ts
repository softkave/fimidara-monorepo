import { RedisClientType } from 'redis';
import { convertToArray } from 'softkave-js-utils';
import { ICacheContext } from './types.js';

const kDeleteJsonIfOwnerScript = `
local existing = redis.call('GET', KEYS[1])
if not existing then
  return 0
end
local data = cjson.decode(existing)
if data.lockedBy == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export class RedisCacheProvider implements ICacheContext {
  constructor(protected redis: RedisClientType) {}

  get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  getList(keys: string[]): Promise<Array<string | null>> {
    if (keys.length === 0) {
      return Promise.resolve([]);
    }

    return this.redis.mGet(keys);
  }

  async getJsonList<T>(keys: string[]): Promise<Array<T | null>> {
    if (keys.length === 0) {
      return Promise.resolve([]);
    }

    const values = await this.redis.mGet(keys);
    return values.map(value => (value ? JSON.parse(value) : null));
  }

  async set(
    key: string,
    value: string | Buffer,
    opts?: {ttlMs?: number}
  ): Promise<void> {
    await this.redis.set(key, value, {PX: opts?.ttlMs});
  }

  async setJson<T>(
    key: string,
    value: T,
    opts?: {ttlMs?: number}
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), {PX: opts?.ttlMs});
  }

  async setJsonNx<T>(
    key: string,
    value: T,
    opts?: {ttlMs?: number}
  ): Promise<boolean> {
    const result = await this.redis.set(key, JSON.stringify(value), {
      NX: true,
      ...(opts?.ttlMs ? {PX: opts.ttlMs} : {}),
    });
    return result === 'OK';
  }

  async deleteJsonIfOwner(key: string, ownerId: string): Promise<boolean> {
    const result = await this.redis.eval(kDeleteJsonIfOwnerScript, {
      keys: [key],
      arguments: [ownerId],
    });
    return result === 1;
  }

  async setList(
    list: Array<{key: string; value: string | Buffer}>
  ): Promise<void> {
    await this.redis.mSet(
      list.map(({key, value}) => [key, value] as [string, string | Buffer])
    );
  }

  async setJsonList<T>(list: Array<{key: string; value: T}>): Promise<void> {
    await this.redis.mSet(
      list.map(
        ({key, value}) => [key, JSON.stringify(value)] as [string, string]
      )
    );
  }

  async delete(key: string | string[]): Promise<void> {
    await this.redis.del(convertToArray(key));
  }
}
