import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Customer } from './customer.entity';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { AddMovementDto } from './dto/addMovement.dto';

import { Movement } from '../types';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: MongoRepository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    /*
      This method creates a new customer record, and saves it to the db.
      The original password is hashed using bcrypt before the record is saved.

      Parameters:
        - createCustomerDto
            A data transfer object containing the new customer data.

      Returns:
        - The newly created customer.
    */
    // Hash the original password using bcrypt with 10 rounds
    const password = await bcrypt.hash(createCustomerDto.password, 10);
    // Save and return new record with hashes password
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      password,
    });
    return this.customerRepository.save(customer);
  }

  findCustomers() {
    /*
      This method finds a list of all customers

      Parameters:
        None

      Returns:
        - An array of all customers, an empty array if none exist.
    */
    return this.customerRepository.find();
  }

  findById(customerId: ObjectId) {
    /*
      This method finds a customer by it's id

      Parameters:
        - customerId(required)
            An objectId of the customer record.

      Returns:
        - A customer object if found, or null if not found.
    */
    return this.customerRepository.findOneBy({ _id: customerId });
  }

  findByEmail(email: string) {
    /*
      This method finds a customer by it's email

      Parameters:
        - email(required)
            A string of the customer's email.

      Returns:
        - A customer object if found, or null if not found.
    */
    return this.customerRepository.findOneBy({ email });
  }

  async addMovement(customerId: ObjectId, addMovement: AddMovementDto) {
    /*
      This method adds a new movement to the account.
      Movement types are either "Deposit" or "Withdrawal".
      A customer requests to add a new movement, and the movement is added with the current account balance
      after the change.

      Parameters:
        - customerId(required)
            An objectId of the customer record.
        - addMovement(required)
            A data transfer object containing the movement requested to add.

      Returns:
        - Added movement

      Raises:
        - A 404 if customer isn't found
    */
    // Read current customer
    const customer = await this.customerRepository.findOneBy({
      _id: customerId,
    });

    // Raise a 404 if customer is not found
    if (!customer) throw new NotFoundException('Customer not found');

    // Prepare new movement object with updated balance based on account balance + movement amount and createdAt
    const movement: Movement = {
      ...addMovement,
      balance: customer.account.balance + addMovement.amount,
      createdAt: new Date(),
    };

    // Update account balance after added movement
    customer.account.balance += addMovement.amount;
    // Push in new movement
    customer.account.movements.push(movement);

    // Save and return added movement
    await this.customerRepository.save(customer);
    return movement;
  }

  async findMovements(customerId: ObjectId) {
    /*
      This method lists all the movements of a particular customer.

      Parameters:
        - customerId(required)
            An objectId of the customer record.

      Returns:
        - An array of the customers' movements.

      Raises:
        - A 404 if customer isn't found
    */
    // Read current customer
    const customer = await this.customerRepository.findOneBy({
      _id: customerId,
    });

    // Raise a 404 if customer is not found
    if (!customer) throw new NotFoundException('Customer not found');

    // Return movements
    return customer.account.movements;
  }

  reports(customerId: ObjectId) {
    /*
      This method lists a report of the summary of each type of movement.
      e.g: overall sum deposited.

      Parameters:
        - customerId(required)
            An objectId of the customer record.

      Returns:
        - An array of documents detailing the type of movement and it's respective total sum.
          example:
          [
              {
                  "_id": "Withdrawal",
                  "total": -200
              },
              {
                  "_id": "Deposit",
                  "total": 800
              }
          ]
    */
    // Prepare the pipeline
    // 1. The customer collection is filtered to display only the current customer's result
    // 2. The account nested document is brought up to replace the root document to prepare for the final returned structure
    // 3. The movements array is unwinded to be able to group by movement type
    // 4. Movements are grouped by type
    // 5. A "total" field is added to the group pipe to show the sum of each movement type
    const pipeline = [
      {
        $match: { _id: customerId },
      },
      {
        $replaceRoot: {
          newRoot: '$account',
        },
      },
      {
        $unwind: '$movements',
      },
      {
        $group: {
          _id: '$movements.type',
          total: {
            $sum: '$movements.amount',
          },
        },
      },
    ];

    // Return the result
    return this.customerRepository.aggregate(pipeline).toArray();
  }
}
