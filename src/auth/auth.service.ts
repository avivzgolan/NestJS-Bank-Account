import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CustomerService } from '../customer/customer.service';

import { CreateCustomerDto } from '../customer/dto/create-customer.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {}

  signup(createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  async login(loginDto: LoginDto) {
    const customer = await this.customerService.findByEmail(loginDto.email);

    if (!customer)
      throw new NotFoundException('No user exists with the given email');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      customer.password,
    );

    if (!isPasswordValid) throw new UnauthorizedException();

    const payload = { username: customer.name, sub: customer.id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
