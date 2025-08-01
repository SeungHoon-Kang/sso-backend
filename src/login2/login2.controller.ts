import { Controller } from '@nestjs/common';
import { Login2Service } from './login2.service';
// import { CreateLogin2Dto } from './dto/create-login2.dto';
// import { UpdateLogin2Dto } from './dto/update-login2.dto';

@Controller('login2')
export class Login2Controller {
  constructor(private readonly login2Service: Login2Service) { }

  // @Post()
  // create(@Body() createLogin2Dto: CreateLogin2Dto) {
  //   return this.login2Service.create(createLogin2Dto);
  // }

  // @Get()
  // findAll() {
  //   return this.login2Service.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.login2Service.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLogin2Dto: UpdateLogin2Dto) {
  //   return this.login2Service.update(+id, updateLogin2Dto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.login2Service.remove(+id);
  // }
}
