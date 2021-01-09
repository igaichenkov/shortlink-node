import { PartialType } from '@nestjs/swagger';
import { CreateLinkDTO } from './create-link.dto';

export class UpdateLinkDTO extends PartialType(CreateLinkDTO) {}
