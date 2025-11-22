# TypeScript vs JavaScript - Code Comparison

This document shows the transformation from JavaScript to TypeScript with type safety improvements.

## Models

### Before (JavaScript)
```javascript
const UserModel = require('../models/userModel');

class UserModel {
  static async create(data) {
    const id = uuidv4();
    const item = {
      PK: id,
      SK: id,
      firstname: data.firstname,
      age: data.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // ...
  }
  
  static async getById(id) {
    // ...
    return result.Item;
  }
}

module.exports = UserModel;
```

### After (TypeScript)
```typescript
import { v4 as uuidv4 } from 'uuid';

export interface User {
  PK: string;
  SK: string;
  firstname: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstname: string;
  age: number;
}

class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const id = uuidv4();
    const item: User = {
      PK: id,
      SK: id,
      firstname: data.firstname,
      age: data.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // ...
    return item;
  }
  
  static async getById(id: string): Promise<User> {
    // ...
    return result.Item as User;
  }
}

export default UserModel;
```

**Benefits:**
- ✅ Clear data structure with `User` interface
- ✅ Type-safe function parameters and return types
- ✅ Autocomplete for user properties
- ✅ Compile-time error checking

---

## Controllers

### Before (JavaScript)
```javascript
const UserModel = require('../models/userModel');

exports.createUser = async (req, res) => {
  try {
    const { firstname, age } = req.body;

    if (!firstname || age === undefined) {
      return res.status(400).json({ error: 'Firstname and age are required' });
    }

    const user = await UserModel.create({ firstname, age });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.getById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### After (TypeScript)
```typescript
import { Request, Response } from 'express';
import UserModel from '../models/userModel';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstname, age } = req.body;

    if (!firstname || age === undefined) {
      res.status(400).json({ error: 'Firstname and age are required' });
      return;
    }

    if (typeof age !== 'number' || age < 0) {
      res.status(400).json({ error: 'Age must be a positive number' });
      return;
    }

    const user = await UserModel.create({ firstname, age });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserModel.getById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**Benefits:**
- ✅ Type-safe request and response objects
- ✅ Explicit `Promise<void>` return type
- ✅ Proper error type checking with `instanceof Error`
- ✅ Named exports instead of exports object

---

## Routes

### Before (JavaScript)
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

### After (TypeScript)
```typescript
import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
```

**Benefits:**
- ✅ ES6 import syntax
- ✅ Type-checked controller imports
- ✅ Default export for router

---

## Lambda Handlers

### Before (JavaScript)
```javascript
const awsServerlessExpress = require('aws-serverless-express');
const app = require('../app');

const server = awsServerlessExpress.createServer(app);

exports.createUserHandler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

exports.getAllUsersHandler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
```

### After (TypeScript)
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import awsServerlessExpress from 'aws-serverless-express';
import app from '../app';

const server = awsServerlessExpress.createServer(app);

export const createUserHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const getAllUsersHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
```

**Benefits:**
- ✅ Type-safe AWS Lambda event and context
- ✅ Explicit return type `APIGatewayProxyResult`
- ✅ Async/await syntax
- ✅ IntelliSense for AWS Lambda properties

---

## Express App

### Before (JavaScript)
```javascript
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json({ type: (req) => req.get('content-type') && req.get('content-type').includes('json') }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/user', userRoutes);

module.exports = app;
```

### After (TypeScript)
```typescript
import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json({ type: (req) => req.headers['content-type']?.includes('json') || false }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/user', userRoutes);

export default app;
```

**Benefits:**
- ✅ Type-safe Express request/response
- ✅ Optional chaining with null safety
- ✅ Unused parameter marked with `_req`
- ✅ Default export

---

## Local Development Server

### Before (JavaScript)
```javascript
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
  console.log(`Connected to DynamoDB Table: ${process.env.TABLE_NAME}`);
  console.log(`AWS Region: ${process.env.AWS_REGION_NAME}`);
});
```

### After (TypeScript)
```typescript
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
  console.log(`Connected to DynamoDB Table: ${process.env.TABLE_NAME}`);
  console.log(`AWS Region: ${process.env.AWS_REGION_NAME}`);
});
```

**Benefits:**
- ✅ ES6 imports
- ✅ Type-safe environment variables
- ✅ Better IDE support

---

## Summary of Improvements

### Type Safety
- All function parameters are typed
- Return types are explicit
- Interfaces define data structures
- Compile-time error checking

### Modern JavaScript
- ES6 import/export syntax
- Optional chaining (`?.`)
- Nullish coalescing (`||`)
- Async/await patterns

### Developer Experience
- Full IntelliSense support
- Autocomplete for all APIs
- Jump to definition
- Find all references
- Safe refactoring

### Code Quality
- Self-documenting code
- Catch errors early
- Enforce consistent patterns
- Better collaboration
