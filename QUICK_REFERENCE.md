# TypeScript Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Clean build artifacts
npm run clean
```

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server with auto-reload
npm start                # Build and start production server
npm run build            # Compile TypeScript to JavaScript
```

### Building for Deployment
```bash
npm run build                    # Compile TS → JS (dist/)
npm run custom-build -- user     # Build Lambda package
```

### Generate New Endpoint
```bash
npm run generate-endpoint <service> <function> <method> <path>

# Example:
npm run generate-endpoint student createStudent POST /student
```

## 📂 Project Structure

```
src/              → TypeScript source files (*.ts)
dist/             → Compiled JavaScript (*.js)
build/            → Lambda deployment packages
scripts/          → Build and generation scripts (*.ts)
tsconfig.json     → TypeScript configuration
```

## 🔧 TypeScript Patterns

### Models
```typescript
export interface User {
  PK: string;
  SK: string;
  firstname: string;
  age: number;
}

export interface CreateUserData {
  firstname: string;
  age: number;
}

class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    // Implementation
  }
}

export default UserModel;
```

### Controllers
```typescript
import { Request, Response } from 'express';

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstname, age } = req.body;
  // Implementation
};
```

### Routes
```typescript
import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();
router.post('/', userController.createUser);

export default router;
```

### Lambda Handlers
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Implementation
};
```

## 🎯 Type Definitions

### Available Types
- `Request, Response` - from `express`
- `APIGatewayProxyEvent, APIGatewayProxyResult, Context` - from `aws-lambda`
- `DynamoDBClient, PutCommand, GetCommand, etc.` - from `@aws-sdk/client-dynamodb`
- All Node.js built-ins - from `@types/node`

### Custom Types
Define in model files:
```typescript
export interface MyData {
  id: string;
  name: string;
  createdAt: string;
}
```

## 🐛 Troubleshooting

### Module not found errors
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Compilation errors
```bash
# Clean and rebuild
npm run clean
npm run build
```

### Type errors in IDE
```bash
# Ensure dependencies are installed
npm install
```

## 📚 Documentation

- [TYPESCRIPT_MIGRATION.md](./TYPESCRIPT_MIGRATION.md) - Migration guide
- [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - Summary of changes
- [CODE_COMPARISON.md](./CODE_COMPARISON.md) - Before/after examples
- [README.md](./README.md) - Full project documentation

## ⚡ Tips

1. **Always compile before deploying**: `npm run build`
2. **Use dev mode for development**: `npm run dev`
3. **Let TypeScript catch errors**: Don't ignore type errors
4. **Leverage autocomplete**: Use IntelliSense extensively
5. **Define interfaces early**: Good types make better code

## 🎓 Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript with Express](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [AWS Lambda TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html)
