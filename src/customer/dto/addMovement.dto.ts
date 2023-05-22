import { IsEnum, IsNumber } from 'class-validator';

import { MovementTypes } from '../../types';

export class AddMovementDto {
  @IsEnum(MovementTypes)
  type: MovementTypes;

  @IsNumber()
  amount: number;
}
