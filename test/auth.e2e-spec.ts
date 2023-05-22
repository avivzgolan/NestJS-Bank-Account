import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

import { Customer } from '../src/customer/customer.entity';

import { AuthService } from '../src/auth/auth.service';

import { CreateCustomerDto } from '../src/customer/dto/create-customer.dto';

import { mockCustomer } from './mocks/customer';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let customerRepository: MongoRepository<Customer>;
  let access_token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Customer])],
    }).compile();

    app = moduleFixture.createNestApplication();

    authService = moduleFixture.get<AuthService>(AuthService);
    customerRepository =
      moduleFixture.get<MongoRepository<Customer>>('CustomerRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await authService.signup(mockCustomer);

    const login = await authService.login({
      email: mockCustomer.email,
      password: mockCustomer.password,
    });

    access_token = login.access_token;
  });

  afterEach(async () => {
    await customerRepository.deleteMany({});
  });

  describe('Testing system auth', () => {
    test('An unauthorized user tries to access a protected route, expect 401 Unauthorized', async () => {
      // Act
      const response = await request(app.getHttpServer()).get('/customers');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    test('An authorized user tries to access a protected route, expect 200', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${access_token}`);

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('POST /auth', () => {
    test('Signup to the system, expect 201 with a new customer', async () => {
      // Arrange
      const customer: CreateCustomerDto = {
        ...mockCustomer,
        email: 'john@gmail.com',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(customer);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.email).toEqual(customer.email);
    });

    test('Login to the system, expect 200 with an access token', async () => {
      // Arrange
      const loginDetails = {
        email: mockCustomer.email,
        password: mockCustomer.password,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDetails);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
    });
  });
});
