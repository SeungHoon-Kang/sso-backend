import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { LoginHist } from '../entities/login-hist.entity';
import { CognitoService } from './cognito.service';
import { LoginService } from '../login/login.service';
import { CacheModule } from 'src/valkey/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoginHist]), CacheModule],
  controllers: [AuthController],
  providers: [AuthService, CognitoService, LoginService],
})
export class AuthModule { }