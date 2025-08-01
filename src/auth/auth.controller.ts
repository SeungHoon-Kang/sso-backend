import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string, @Req() req) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    return await this.authService.loginWithCredentials(email, password, ip, userAgent);
  }

  @Post('socialLogin')
  async socialLogin(@Body('socialKey') socialKey: string, @Req() req) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    return await this.authService.loginWithSocialToken(socialKey, ip, userAgent);
  }

  @Post('logout')
  async logout(@Body() body, @Req() req) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.logout(body.userId, body.token, ip, userAgent);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string, @Body('email') email: string) {
    return this.authService.refreshAccessToken(refreshToken, email);
  }
}