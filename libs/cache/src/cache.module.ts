// cache.module.ts
import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  providers: [CacheService],
  exports: [CacheService], // 다른 모듈에서 사용 가능하도록 export 필수
})
export class CacheModule { }