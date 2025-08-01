import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
// import { LoginHist } from '../entities/login-hist.entity';
import { CognitoService } from './cognito.service';
import { LoginService } from '../login/login.service';
// import * as bcrypt from 'bcrypt';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cognitoService: CognitoService,
    private loginService: LoginService,
  ) { }

  // 회원가입 (이메일 회원가입)
  async register(data: Partial<User>) {

    if (!data.email) {
      throw new BadRequestException('Email is required');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) throw new BadRequestException('User already exists');

    const client = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });

    // Cognito 사용자 생성
    const createdResponse = await client.send(new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: data.name, // 이메일 ID 부분만 username으로 사용
      UserAttributes: [
        { Name: 'email', Value: data.email },
        { Name: 'name', Value: data.name },
      ],
      MessageAction: 'SUPPRESS',
    }));


    if (createdResponse.$metadata.httpStatusCode === 200) {

      // 비밀번호 설정
      if (data.password) {
        console.log('check the flow : ');

        await client.send(new AdminSetUserPasswordCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: data.name,
          Password: data.password,
          Permanent: true,
        }));
      }

      // DB 저장
      const newUser = this.userRepository.create(data);
      return await this.userRepository.save(newUser);

    } else {
      throw new BadRequestException('Failed to create user in Cognito');
    }

    // 회원가입 후, 이메일 인증으로 is_active 값 true 로 변경해야함.
  }


  async refreshAccessToken(refreshToken: string, email: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const client = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });

    // 클라이언트 시크릿이 있을 경우 secret hash 필요
    function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
      return crypto
        .createHmac('SHA256', clientSecret)
        .update(username + clientId)
        .digest('base64');
    }

    // 만약 사용자 이름(Username)이 필요하면 토큰과 함께 보내거나 별도로 조회해야 함
    // 여기선 refresh 토큰에 유저 이름을 포함하지 않았으니 클라이언트가 전달해야 할 수도 있음
    // 예시로 username을 파라미터로 받는다고 가정:
    // async refreshAccessToken(username: string, refreshToken: string)

    // username이 필요하다면 파라미터로 받으세요

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const username = user.name;
    const clientId = process.env.COGNITO_CLIENT_ID ?? '';
    const clientSecret = process.env.COGNITO_CLIENT_SECRET ?? '';
    const secretHash = generateSecretHash(username, clientId, clientSecret);

    try {
      const response = await client.send(new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: secretHash,
          USERNAME: username,
        },
      }));

      const authResult = response.AuthenticationResult;

      if (!authResult || !authResult.AccessToken) {
        throw new UnauthorizedException('Failed to refresh token');
      }

      return {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        expiresIn: authResult.ExpiresIn,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new UnauthorizedException('Invalid refresh token or unable to refresh');
    }
  }




  // async loginWithCredentials(email: string, password: string, ip: string, userAgent: string) {


  //   const client = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });
  //   if (!email || !password) {
  //     throw new BadRequestException('Email and password are required');
  //   }

  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }


  //   function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  //     return crypto
  //       .createHmac('SHA256', clientSecret)
  //       .update(username + clientId)
  //       .digest('base64');
  //   }


  //   const secretHash = generateSecretHash(user.name, process.env.COGNITO_CLIENT_ID ?? "g77md7od62ilsvkrd0qb6jbno", process.env.COGNITO_CLIENT_SECRET ?? "qb0fjh49n6tfih6t5dnj2o4sl8ghrjudk35p33gtaj9q6cv0h5f");
  //   // const hashedPassword = await utils.hashPassword(password);
  //   console.log(email, password, ip, userAgent);

  //   const response = await client.send(new AdminInitiateAuthCommand({
  //     UserPoolId: process.env.COGNITO_USER_POOL_ID,
  //     ClientId: process.env.COGNITO_CLIENT_ID,
  //     AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
  //     AuthParameters: { USERNAME: user.name, PASSWORD: password, SECRET_HASH: secretHash },
  //   }));

  //   const token = response.AuthenticationResult?.IdToken;
  //   if (!token) throw new UnauthorizedException('Invalid login');

  //   if (!user) throw new UnauthorizedException('User not found');

  //   await this.loginService.saveLoginHistory({
  //     user_id: user.id,
  //     access_token: token,
  //     ip_address: ip,
  //     user_agent: userAgent,
  //     login_type: 'cognito',
  //     success: true,
  //     fail_reason: '',
  //   });

  //   return { token, user };
  // }



  async loginWithCredentials(email: string, password: string, ip: string, userAgent: string) {
    const client = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
      return crypto
        .createHmac('SHA256', clientSecret)
        .update(username + clientId)
        .digest('base64');
    }

    const secretHash = generateSecretHash(
      user.name,
      process.env.COGNITO_CLIENT_ID ?? "g77md7od62ilsvkrd0qb6jbno",
      process.env.COGNITO_CLIENT_SECRET ?? "qb0fjh49n6tfih6t5dnj2o4sl8ghrjudk35p33gtaj9q6cv0h5f"
    );

    console.log(email, password, ip, userAgent);

    const response = await client.send(new AdminInitiateAuthCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: user.name,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    }));

    const authResult = response.AuthenticationResult;
    if (!authResult || !authResult.AccessToken || !authResult.RefreshToken) {
      throw new UnauthorizedException('Invalid login');
    }

    await this.loginService.saveLoginHistory({
      user_id: user.id,
      access_token: authResult.AccessToken,
      ip_address: ip,
      user_agent: userAgent,
      login_type: 'cognito',
      success: true,
      fail_reason: '',
    });

    return {
      accessToken: authResult.AccessToken,
      refreshToken: authResult.RefreshToken,
      // idToken: authResult.IdToken,
      expiresIn: authResult.ExpiresIn,
      user,
    };
  }

  async loginWithSocialToken(idToken: string, ip: string, userAgent: string) {
    const decoded = await this.cognitoService.verifyToken(idToken);
    console.log(decoded);

    const email = (decoded as { email: string })['email'];
    if (!email) {
      throw new UnauthorizedException('Invalid social token');
    }

    // 2) DB에서 유저 조회
    let user = await this.userRepository.findOne({ where: { email } });

    // 3) 유저가 없으면 신규 등록
    if (!user) {
      user = await this.userRepository.save({
        email,
        name: (decoded as any).name || '',  // 소셜 프로필에서 가져올 수 있으면
        provider: (decoded as any).identities?.[0]?.providerName || 'social',
        reg_ip: ip,
        reg_user_agent: userAgent,
      });
    }

    // 4) 로그인 이력 저장
    await this.loginService.saveLoginHistory({
      user_id: user.id,
      access_token: idToken,
      ip_address: ip,
      user_agent: userAgent,
      login_type: 'social',
      success: true,
      fail_reason: '',
    });

    // 5) 소셜 로그인은 Cognito에서 이미 인증된 토큰을 사용하므로 추가 인증 불필요
    return { user, token: idToken };
  }

  // 로그아웃
  // async logout(userId: number, token: string, ip: string, userAgent: string) {
  //   await this.loginService.saveLoginHistory({
  //     user_id: userId,
  //     access_token: token,
  //     ip_address: ip,
  //     user_agent: userAgent,
  //     login_type: 'logout',
  //     success: true,
  //     fail_reason: '',
  //   });

  //   return { message: 'Logout successful' };
  // }

  async logout(userId: number, token: string, ip: string, userAgent: string) {
    const client = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });

    await client.send(new GlobalSignOutCommand({
      AccessToken: token,
    }));

    await this.loginService.saveLoginHistory({
      user_id: userId,
      access_token: token,
      ip_address: ip,
      user_agent: userAgent,
      login_type: 'logout',
      success: true,
      fail_reason: '',
    });

    return { message: 'Logout successful' };
  }
}