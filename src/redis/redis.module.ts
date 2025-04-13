import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('redis_server_host'),
            port: configService.get('redis_server_port')
          },
          // database 指定为 1，因为我们之前都是用的默认的 0
          // redis 的 database 就是一个命名空间的概念
          // 把存储的 key-value 的数据放到不同命名空间下，避免冲突。
          database: configService.get('redis_server_db'),
        });
        await client.connect();
        return client;
      },
      inject:[ConfigService]
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
