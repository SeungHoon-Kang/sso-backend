import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginHist } from 'src/entities/login-hist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Login2Service {
  constructor(
    @InjectRepository(LoginHist)
    private loginHistRepository: Repository<LoginHist>,
  ) { }

  async saveLoginHistory(data: Partial<LoginHist>) {
    const loginHist = this.loginHistRepository.create(data);
    return await this.loginHistRepository.save(loginHist);
  }

  // create(createLogin2Dto: CreateLogin2Dto) {
  //   return 'This action adds a new login2';
  // }

  // findAll() {
  //   return `This action returns all login2`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} login2`;
  // }

  // update(id: number, updateLogin2Dto: UpdateLogin2Dto) {
  //   return `This action updates a #${id} login2`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} login2`;
  // }
}
