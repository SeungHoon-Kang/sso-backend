import { Test, TestingModule } from '@nestjs/testing';
import { Login2Service } from './login2.service';

describe('Login2Service', () => {
  let service: Login2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Login2Service],
    }).compile();

    service = module.get<Login2Service>(Login2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
