import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

import { Customer } from '../src/customer/customer.entity';

import { CustomerService } from '../src/customer/customer.service';
import { AuthService } from '../src/auth/auth.service';

import { MovementTypes } from '../src/types';

import { mockCustomer } from './mocks/customer';
import { mockDeposit, mockWithdrawal } from './mocks/movement';

describe('CustomerController (e2e)', () => {
  let app: INestApplication;
  let customerService: CustomerService;
  let authService: AuthService;
  let customerRepository: MongoRepository<Customer>;
  let access_token: string;
  let customer: Partial<Customer>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Customer])],
    }).compile();

    app = moduleFixture.createNestApplication();

    customerService = moduleFixture.get<CustomerService>(CustomerService);
    authService = moduleFixture.get<AuthService>(AuthService);
    customerRepository =
      moduleFixture.get<MongoRepository<Customer>>('CustomerRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    customer = await authService.signup(mockCustomer);

    const login = await authService.login({
      email: mockCustomer.email,
      password: mockCustomer.password,
    });

    access_token = login.access_token;
  });

  afterEach(async () => {
    await customerRepository.deleteMany({});
  });

  describe('POST /customers', () => {
    test('Create customer, expect 201 with input name equal output name', async () => {
      // Arrange
      const name = 'new customer name';

      // Act
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...mockCustomer, name });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(name);
    });

    test('Add movement, expect 201 with input amount equal output amount', async () => {
      // Arrange
      const amount = 5499;

      // Act
      const response = await request(app.getHttpServer())
        .post(`/customers/${customer.id}/movements`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...mockDeposit, amount });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.amount).toEqual(amount);
    });

    test('Add movement, expect 201 with movement balance equal account balance', async () => {
      // Arrange
      const amount = 5499;

      // Act
      const response = await request(app.getHttpServer())
        .post(`/customers/${customer.id}/movements`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...mockDeposit, amount });

      const updatedCustomer = await customerService.findById(customer.id);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.balance).toEqual(amount);
      expect(updatedCustomer.account.balance).toEqual(amount);
    });
  });

  describe('GET /customers', () => {
    test('Get all customers, expect 200 with a list of customers', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${access_token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toEqual(customer.id.toString());
    });

    test('Get customer by id, expect 200 with customer id equal existing customer id', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get(`/customers/${customer.id}`)
        .set('Authorization', `Bearer ${access_token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(customer.id.toString());
    });

    test("Get customer's movements, expect 200 with the customer's movements", async () => {
      // Arrange
      const movement = await customerService.addMovement(customer.id, {
        ...mockDeposit,
        amount: 45555,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/customers/${customer.id}/movements`)
        .set('Authorization', `Bearer ${access_token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].amount).toEqual(movement.amount);
    });

    test("Get customer's reports, expect 200 with the report totals correctly summed", async () => {
      // Arrange
      const deposit = await customerService.addMovement(customer.id, {
        ...mockDeposit,
        amount: 45555,
      });
      const secondDeposit = await customerService.addMovement(customer.id, {
        ...mockDeposit,
        amount: 357,
      });
      const withdrawal = await customerService.addMovement(customer.id, {
        ...mockWithdrawal,
        amount: 7777777,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/customers/${customer.id}/reports`)
        .set('Authorization', `Bearer ${access_token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(
        response.body.find((doc) => doc._id == MovementTypes.DEPOSIT).total,
      ).toEqual(deposit.amount + secondDeposit.amount);
      expect(
        response.body.find((doc) => doc._id == MovementTypes.WITHDRAWAL).total,
      ).toEqual(withdrawal.amount);
    });
  });
});
