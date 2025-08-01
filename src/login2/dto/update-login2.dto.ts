import { PartialType } from '@nestjs/mapped-types';
import { CreateLogin2Dto } from './create-login2.dto';

export class UpdateLogin2Dto extends PartialType(CreateLogin2Dto) {}
