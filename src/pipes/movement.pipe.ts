import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

import { AddMovementDto } from '../customer/dto/addMovement.dto';

import { MovementTypes } from '../types';

@Injectable()
export class MovementValidationPipe
  implements PipeTransform<AddMovementDto, AddMovementDto>
{
  /*
    This pipe validates a new movement, and checks that the movement type corresponds with the amount.
    A deposit must have a positive amount, while a withdrawal must have a negative amount.

    Parameters:
      addMovementDto
        A data transfer object for add movement

    Returns:
      addMovementDto
        If valid, returns the same data transfer object for processing

    Raises:
        A 400 bad request error if the above validation fails
  */
  transform(addMovementDto: AddMovementDto) {
    // A deposit is valid if the movement type is a deposit and the amount is positive
    const validDeposit =
      addMovementDto.type == MovementTypes.DEPOSIT && addMovementDto.amount > 0;
    // A withdrawal is valid if the movement type is a withdrawal and the amount is negative
    const validWithdrawal =
      addMovementDto.type == MovementTypes.WITHDRAWAL &&
      addMovementDto.amount < 0;

    // Raise an error is invalid
    if (!validDeposit && !validWithdrawal)
      throw new BadRequestException(
        'Invalid movement type and amount combination',
      );

    // Return dto object for processing if valid
    return addMovementDto;
  }
}
