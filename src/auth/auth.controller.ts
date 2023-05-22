import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { CreateCustomerDto } from '../customer/dto/create-customer.dto';
import { LoginDto } from './dto/login.dto';

import { Public } from '../decorators/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() createCustomerDto: CreateCustomerDto) {
    return this.authService.signup(createCustomerDto);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
