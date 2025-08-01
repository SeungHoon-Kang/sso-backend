import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { LoginHist } from './entities/login-hist.entity';
import { UserRole } from './entities/user-role.entity';
import { AuthModule } from './auth/auth.module';
import { Login2Module } from './login2/login2.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 환경 변수 로드 및 전역 사용
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, LoginHist, UserRole],
        synchronize: false,
      }),
    }),
    AuthModule,
    Login2Module,
  ],
})
export class AppModule { }