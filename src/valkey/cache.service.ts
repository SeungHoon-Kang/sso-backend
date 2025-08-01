// src/common/valkey/valkey.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  // 어디든지 사용 가능
  onModuleInit() {
    this.client = new Redis({
      host: process.env.VALKEY_HOST,
      port: Number(process.env.VALKEY_PORT),
      tls: process.env.VALKEY_TLS === 'true' ? {} : undefined,
    });

    this.client.on('connect', () => {
      console.log('[Valkey] Connected');
    });

    this.client.on('error', (err) => {
      console.error('[Valkey] Connection error:', err);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(`token:${key}`);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.client.set(`token:${key}`, value, 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(`token:${key}`);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(`token:${key}`)) === 1;
  }

  async addSession(userId: number, token: string, ttl: number): Promise<void> {
    const key = `session:${userId}`;
    const score = Date.now(); // 현재 시간 기준

    await this.client.zadd(key, score, token);
    await this.client.expire(key, ttl); // TTL 설정
  }

  async getSessions(userId: number): Promise<string[]> {
    const key = `session:${userId}`;
    return await this.client.zrange(key, 0, -1); // 모든 세션 조회
  }

  async removeSession(userId: number, token: string): Promise<void> {
    const key = `session:${userId}`;
    await this.client.zrem(key, token);
  }

  async getSessionCount(userId: number): Promise<number> {
    const key = `session:${userId}`;
    return await this.client.zcard(key);
  }

  /** 세션 초과 시 오래된 토큰 삭제 */
  async enforceSessionLimit(
    userId: number,
    maxSessions: number,
  ): Promise<void> {
    const key = `session:${userId}`;
    const currentSessions = await this.client.zrange(key, 0, -1);
    console.log('[Valkey] currentSessions:', currentSessions.length);
    console.log('[Valkey] maxSessions:', maxSessions);
    if (currentSessions.length >= maxSessions) {
      const removeCount = currentSessions.length - maxSessions + 1;
      const tokensToRemove = await this.client.zrange(key, 0, removeCount - 1);
      for (const token of tokensToRemove) {
        await this.client.zrem(key, token); // 세션 정리
        await this.del(token); // token:xxx 키 삭제
      }
    }
  }
}
