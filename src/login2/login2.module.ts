import { Module } from '@nestjs/common';
import { Login2Service } from './login2.service';
import { Login2Controller } from './login2.controller';

@Module({
  controllers: [Login2Controller],
  providers: [Login2Service],
})
export class Login2Module {}
