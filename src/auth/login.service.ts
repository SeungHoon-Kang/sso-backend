import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHist } from '../entities/login-hist.entity';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginHist)
    private loginHistRepository: Repository<LoginHist>,
  ) { }

  async saveLoginHistory(data: Partial<LoginHist>) {
    const loginHist = this.loginHistRepository.create(data);
    return await this.loginHistRepository.save(loginHist);
  }
}
