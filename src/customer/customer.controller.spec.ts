import { Test, TestingModule } from '@nestjs/testing';

import { CustomerController } from './customer.controller';

import { CustomerService } from './customer.service';

import { Customer } from './customer.entity';

import { Movement } from '../types';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let customerService: CustomerService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            findCustomers: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            addMovement: jest.fn(),
            findMovements: jest.fn(),
            reports: jest.fn(),
          },
        },
      ],
    }).compile();

    customerController = moduleRef.get<CustomerController>(CustomerController);
    customerService = moduleRef.get<CustomerService>(CustomerService);
  });

  describe('Testing customer controller methods', () => {
    test('find', async () => {
      // Arrange
      const mockCustomer = new Customer();
      jest
        .spyOn(customerService, 'findCustomers')
        .mockResolvedValue([mockCustomer]);

      // Act
      const result = await customerController.find();

      // Assert
      expect(result).toEqual([mockCustomer]);
      expect(customerService.findCustomers).toHaveBeenCalled();
    });

    test('findById', async () => {
      // Arrange
      const mockCustomer = new Customer();
      jest.spyOn(customerService, 'findById').mockResolvedValue(mockCustomer);

      // Act
      const result = await customerController.findById(mockCustomer.id);

      // Assert
      expect(result).toEqual(mockCustomer);
      expect(customerService.findById).toHaveBeenCalled();
    });

    test('create', async () => {
      // Arrange
      const mockCustomer = new Customer();
      jest.spyOn(customerService, 'create').mockResolvedValue(mockCustomer);

      // Act
      const result = await customerController.create(mockCustomer);

      // Assert
      expect(result).toEqual(mockCustomer);
      expect(customerService.create).toHaveBeenCalled();
    });

    test('addMovement', async () => {
      // Arrange
      const mockCustomer = new Customer();
      const mockMovement = new Movement();
      jest
        .spyOn(customerService, 'addMovement')
        .mockResolvedValue(mockMovement);

      // Act
      const result = await customerController.addMovement(
        mockCustomer.id,
        mockMovement,
      );

      // Assert
      expect(result).toEqual(mockMovement);
      expect(customerService.addMovement).toHaveBeenCalled();
    });

    test('findMovements', async () => {
      // Arrange
      const mockCustomer = new Customer();
      const mockMovement = new Movement();
      jest
        .spyOn(customerService, 'findMovements')
        .mockResolvedValue([mockMovement]);

      // Act
      const result = await customerController.findMovements(mockCustomer.id);

      // Assert
      expect(result).toEqual([mockMovement]);
      expect(customerService.findMovements).toHaveBeenCalled();
    });

    test('reports', async () => {
      // Arrange
      const mockCustomer = new Customer();
      const mockReport: any = [
        {
          _id: 'Withdrawal',
          total: -200,
        },
        {
          _id: 'Deposit',
          total: 800,
        },
      ];
      jest.spyOn(customerService, 'reports').mockResolvedValue(mockReport);

      // Act
      const result = await customerController.reports(mockCustomer.id);

      // Assert
      expect(result).toEqual(mockReport);
      expect(customerService.reports).toHaveBeenCalled();
    });
  });
});
