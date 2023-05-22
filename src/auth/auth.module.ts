import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CustomerModule } from '../customer/customer.module';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';

import { jwtConstants } from './constants';

@Global()
@Module({
  imports: [
    CustomerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
