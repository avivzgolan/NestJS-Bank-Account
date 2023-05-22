import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransformInstanceToPlain } from 'class-transformer';
import { ObjectId } from 'mongodb';

import { MovementValidationPipe } from '../pipes/movement.pipe';
import { ParseObjectIdPipe } from '../pipes/parse.pipe';

import { CustomerService } from './customer.service';

import { Customer } from './customer.entity';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { AddMovementDto } from './dto/addMovement.dto';

import { Movement } from '../types';

@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @TransformInstanceToPlain()
  find(): Promise<Customer[]> {
    return this.customerService.findCustomers();
  }

  @Get(':customerId')
  @TransformInstanceToPlain()
  findById(
    @Param('customerId', ParseObjectIdPipe) customerId: ObjectId,
  ): Promise<Customer> {
    return this.customerService.findById(customerId);
  }

  @Post()
  @TransformInstanceToPlain()
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Post(':customerId/movements')
  @TransformInstanceToPlain()
  addMovement(
    @Param('customerId', ParseObjectIdPipe) customerId: ObjectId,
    @Body(MovementValidationPipe) addMovementDto: AddMovementDto,
  ): Promise<Movement> {
    return this.customerService.addMovement(customerId, addMovementDto);
  }

  @Get(':customerId/movements')
  @TransformInstanceToPlain()
  findMovements(
    @Param('customerId', ParseObjectIdPipe) customerId: ObjectId,
  ): Promise<Movement[]> {
    return this.customerService.findMovements(customerId);
  }

  @Get(':customerId/reports')
  @TransformInstanceToPlain()
  reports(
    @Param('customerId', ParseObjectIdPipe) customerId: ObjectId,
  ): Promise<any> {
    return this.customerService.reports(customerId);
  }
}
