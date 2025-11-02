import assert from 'assert';
import fs from 'fs';
import Redis from 'ioredis';
import {RedisClientType, createClient} from 'redis';
import {kIjxUtils} from './ijx/injectables.js';

async function getRedisTLSCerts(params: {
  redisCertFilepath?: string;
  redisKeyFilepath?: string;
  redisCaFilepath?: string;
}) {
  const {redisCertFilepath, redisKeyFilepath, redisCaFilepath} = params;
  const [cert, key, ca] = await Promise.all([
    redisCertFilepath ? fs.promises.readFile(redisCertFilepath) : undefined,
    redisKeyFilepath ? fs.promises.readFile(redisKeyFilepath) : undefined,
    redisCaFilepath ? fs.promises.readFile(redisCaFilepath) : undefined,
  ]);

  return {cert, key, ca};
}

export async function getRedis() {
  const params = kIjxUtils.suppliedConfig();
  const {
    redisDatabase,
    redisURL,
    redisPassword,
    redisRequireTLS,
    redisTLSRejectUnauthorized,
  } = params;

  assert.ok(redisURL);

  const redis: RedisClientType = createClient({
    url: redisURL,
    database: redisDatabase,
    password: redisPassword,
    socket: redisRequireTLS
      ? {
          tls: true,
          rejectUnauthorized: redisTLSRejectUnauthorized,
          ...(await getRedisTLSCerts(params)),
        }
      : undefined,
  });

  await redis
    .on('error', err => kIjxUtils.logger().error('Redis error', err))
    .connect();

  return redis;
}

export async function getIoRedis() {
  const params = kIjxUtils.suppliedConfig();
  const {
    redisDatabase,
    redisURL,
    redisRequireTLS,
    redisTLSRejectUnauthorized,
    redisPassword,
  } = params;
  assert.ok(redisURL);

  const p = new URL(redisURL);
  const redis = new Redis.default({
    port: parseInt(p.port),
    host: p.hostname,
    username: p.username,
    password: p.password || redisPassword,
    db: redisDatabase,
    lazyConnect: true,
    tls: redisRequireTLS
      ? {
          rejectUnauthorized: redisTLSRejectUnauthorized,
          ...(await getRedisTLSCerts(params)),
        }
      : undefined,
  });

  await redis
    .on('error', err => kIjxUtils.logger().error('Redis error', err))
    .connect();

  return redis;
}
