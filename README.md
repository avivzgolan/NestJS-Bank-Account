## Description

Bank account application built on NestJS, TypeScript and MongoDB.

## Language

NodeJS was chosen for it's fast single threaded concurrency design, vast community support,
and ease of learning for team members which might be unfamiliar with it; especially for JavaScript developers.

The main potential disadvantage of node: heavy computational tasks based on CPU power, but it was determined not to be an issue given the project requirements.

TypeScript was an easy choice for added type check security and Nest's integral support for TypeScript.

## Database structure

The database model is denormalized to facilitate lightning fast queries,
while organizing all the relevant data in one source.

Due to the above requirement, MongoDB was chosen as the best option to handle a denormalized structure and to ease the integration with NodeJS given it's document JSON-like structure.

Frequent joins were not considered to be needed given the project requirements,
which was another reason for choosing MongoDB.

## Framework

NestJS was chosen as the framework due to it's platform agnostic nature,
which allows for quick and easy changes to the existing architecture.

It's IoC (Inversion of control) design and modular approach adheres closely to the S.O.L.I.D principles,
and helps to avoid common issues such as circular dependencies.

It uses the widely accepted express library under the hood,
and provides a wide range of integrations to useful tools.

## Steps

The recommended setup is to follow the steps below in order:

## Local Mongodb setup

First, if needed, install the latest version of Mongodb community on your machine.
Run your local Mongodb process.

## Env variables

The default options for the env variables are defined for a basic Mongodb setup.
If need be, update these variables with your credentials:

- DB_USERNAME
- DB_PASSWORD

By default, the DB_NAME is defined as 'appfire', if you would like to use a different name for your database,
you can update this variable as well.

The variables are located in two separate .env files for testing and development environments respectively:

- development.env
- test.env

##  Package Installation

```bash
$ npm install
```

## Test

Running the test suite is recommended before moving forward.
Tests are already set up for both unit and e2e.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Base url

The server is setup to listen on port 3000 by default.
Please use the following base url for all of your requests:

http://localhost:3000

The steps below will assume you are prepending the base url above to the given routes.

## Security

The system is protected by a CORS policy exposing only incoming requests from "http//:localhost",
as well as an AuthGuard which protects all routes but the public signup and login.

Please follow the steps below to signup and login to the system before moving forward.

## Setting up a user

First, signup to the system:

POST /auth/signup

Payload:
{
    "name": <NAME>,
    "email": <EMAIL>,
    "password": <STRONG_PASSWORD> (At least one uppercase, one lowercase letters, a special character, mininum length: 12),
    "account": {
        "name": <ACCOUNT_NAME>,
        "type": <ACCOUNT_TYPE> (Right now, only "Private" is allowed)
    }
}

Then, login to the system:

POST /auth/login

Payload:
{
  "email": <EMAIL>
  "password": <STRONG_PASSWORD>
}

Response:

200
{
  "access_token": <JWT_ACCESS_TOKEN>
}

Lastly, to access the protected routes below, send the request with the access token attached as a Bearer token to the Authorization header as follows:

Headers
{
  "Authorization": "Bearer " + <JWT_ACCESS_TOKEN>
}

## Exposed routes

The API exposes the following routes:

GET /customers
  Get a list of the customers, and their account details, in the system

GET /customers/:customerId
  Get a single customer, and it's account details, by it's id

GET /customers/:customerId/movements
  Get a list of the movements in the account of a specific customer, selected by it's id

GET /customers/:customerId/reports
  Get a report displaying the total amounts of each type of movement made in a specific customer's account, selected by it's id and categorized by movement type.

POST /customers/:customerId/movements
  Adds a movement to a specific customer's account, selected by it's id.
  Payload:
  {
    "type": <MOVEMENT_TYPE> ("Deposit" | "Withdrawal"),
    "amount": <NUMBER> (For deposit, only positive numbers are accepted, and negative for withdrawal)
  }

# Feature suggesstions

The following is my wish list for possible future expansions on the application:

Security
- Integration with a user pool management system such as AWS cognito to manage the system's users and allow for extra security features such as MFA setup.

Admin
- An admin should be able to manage a customer account's permissions, such as the maximum debt allowed.

Customer
- A customer should be able to filter a list of movements by criteria, such as between certain dates.
- A customer should not be able to make a withdrawal which would place his account balance under a permited sum.
