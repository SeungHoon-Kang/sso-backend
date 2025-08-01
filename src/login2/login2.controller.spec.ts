import { Test, TestingModule } from '@nestjs/testing';
import { Login2Controller } from './login2.controller';
import { Login2Service } from './login2.service';

describe('Login2Controller', () => {
  let controller: Login2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Login2Controller],
      providers: [Login2Service],
    }).compile();

    controller = module.get<Login2Controller>(Login2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
