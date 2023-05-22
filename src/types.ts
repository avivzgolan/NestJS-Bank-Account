import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export enum AccountTypes {
  PRIVATE = 'Private',
}

export enum MovementTypes {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
}

export class Movement {
  @IsEnum(MovementTypes)
  @IsNotEmpty()
  type: MovementTypes;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsDate()
  createdAt?: Date;
}

export class Account {
  constructor() {
    this.balance = 0;
    this.movements = [];
  }

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AccountTypes)
  @IsNotEmpty()
  type: AccountTypes;

  balance: number;

  @Type(() => Movement)
  movements: Array<Movement>;
}
