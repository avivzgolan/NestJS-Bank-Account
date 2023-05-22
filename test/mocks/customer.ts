import { AccountTypes } from '../../src/types';

export const mockCustomer = {
  name: "customer's name",
  email: 'customer@gmail.com',
  password: 'Password1234567890!',
  account: {
    name: "Customer's account",
    type: AccountTypes.PRIVATE,
    balance: 0,
    movements: [],
  },
};
