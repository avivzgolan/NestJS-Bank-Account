import { AddMovementDto } from '../../src/customer/dto/addMovement.dto';

import { MovementTypes } from '../../src/types';

export const mockWithdrawal: AddMovementDto = {
  type: MovementTypes.WITHDRAWAL,
  amount: -200,
};

export const mockDeposit: AddMovementDto = {
  type: MovementTypes.DEPOSIT,
  amount: 200,
};
