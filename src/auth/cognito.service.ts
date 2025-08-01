import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { CacheService } from '../valkey/cache.service';

@Injectable()
export class CognitoService {
  private client;
  private region = process.env.COGNITO_REGION;
  private userPoolId = process.env.COGNITO_USER_POOL_ID;
  private issuer = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;

  private redis: Redis;
  private cacheTTLSeconds = 6 * 60 * 60; // 6시간

  constructor(private readonly cacheService: CacheService) {
    this.client = jwksClient({
      jwksUri: `${this.issuer}/.well-known/jwks.json`,
    });
  }

  private async getKey(header, callback) {
    const kid = header.kid;

    try {
      const cachedPublicKey = await this.cacheService.get(`jwks:${kid}`);
      if (cachedPublicKey) {
        return callback(null, cachedPublicKey);
      }

      this.client.getSigningKey(kid, async (err, key) => {
        if (err) {
          return callback(err, null);
        }
        const signingKey = key.getPublicKey();

        await this.cacheService.set(`jwks:${kid}`, signingKey, this.cacheTTLSeconds);

        callback(null, signingKey);
      });
    } catch (error) {
      console.log(error);
      // 캐시 에러 시 jwks-rsa에서 키 받아오기 시도
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          return callback(err, null);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    }
  }

  async verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getKey.bind(this),
        {
          issuer: this.issuer,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(new UnauthorizedException('Invalid token'));
          } else {
            resolve(decoded);
          }
        },
      );
    });
  }
}