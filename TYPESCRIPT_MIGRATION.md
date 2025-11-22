# TypeScript Migration Guide

This project has been migrated from JavaScript to TypeScript. Here's what you need to know:

## What Changed

### File Structure
- All `.js` files in `src/` have been converted to `.ts`
- TypeScript compiles to the `dist/` folder
- The `build/` folder still contains the Lambda-ready packages (created from `dist/`)

### New Files
- `tsconfig.json` - TypeScript compiler configuration
- `src/**/*.ts` - TypeScript source files replacing `.js` files
- `scripts/**/*.ts` - TypeScript build scripts

### Dependencies Added
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `@types/*` - Type definitions for Node.js, Express, AWS Lambda, etc.
- `rimraf` - Cross-platform file deletion tool

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build TypeScript to JavaScript
```bash
npm run build
```
This compiles TypeScript from `src/` to JavaScript in `dist/`.

### 3. Development Workflow

#### Local Development
```bash
npm run dev
```
Uses `nodemon` with `ts-node` to auto-reload on changes.

#### Production Build
```bash
npm run build
npm run custom-build -- user
```

### 4. Creating New Endpoints
```bash
npm run generate-endpoint student createStudent POST /student
```
This now generates TypeScript files with proper typing.

## Key Type Improvements

### Controllers
```typescript
import { Request, Response } from 'express';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  // Type-safe request/response handling
};
```

### Models
```typescript
export interface User {
  PK: string;
  SK: string;
  firstname: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}
```

### Handlers
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Type-safe Lambda handler
};
```

## Scripts Reference

- `npm run build` - Compile TypeScript to JavaScript
- `npm run custom-build -- <keyword>` - Build Lambda deployment packages
- `npm run generate-endpoint` - Generate new endpoint (TypeScript)
- `npm start` - Build and run locally
- `npm run dev` - Development mode with hot reload
- `npm run clean` - Remove dist/ and build/ folders

## Deployment

The deployment process remains the same:

```bash
# 1. Build TypeScript
npm run build

# 2. Create Lambda packages
npm run custom-build -- user

# 3. Deploy with SAM
sam build
sam deploy
```

## TypeScript Benefits

1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - IntelliSense, autocomplete, refactoring
3. **Self-Documenting Code** - Types serve as inline documentation
4. **Easier Refactoring** - TypeScript catches breaking changes
5. **Modern JavaScript Features** - Use latest ES features with confidence

## Troubleshooting

### Type Errors During Development
If you see type errors in your IDE but haven't installed dependencies:
```bash
npm install
```

### Build Errors
If TypeScript compilation fails:
1. Check `tsconfig.json` settings
2. Ensure all imports use correct paths
3. Run `npm run clean` and rebuild

### Lambda Handler Not Found
Make sure:
1. You ran `npm run build` before `custom-build`
2. The `template.yaml` points to the correct handler path
3. The handler exports match the template configuration

## Old JavaScript Files

The original JavaScript files are still in place. You can:
- **Keep them** as reference during migration
- **Delete them** once you've verified TypeScript versions work
- Use git to track the transition

To remove old JS files:
```bash
# After verifying everything works
Remove-Item src/**/*.js -Recurse
Remove-Item scripts/**/*.js -Recurse
```

## Notes

- The `custom-build` script now works with the compiled `dist/` folder
- All Lambda functions now have esbuild metadata in `template.yaml`
- The TypeScript compiler is configured for Node.js 18.x (ES2020)
