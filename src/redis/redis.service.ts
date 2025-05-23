import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';


/**
   注入 redisClient，实现 get、set 方法，set 方法支持指定过期时间
 * 
 */
@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }
}
