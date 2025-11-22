# Serverless Microservice Backend with Cognito Authentication (TypeScript)

A serverless Lambda backend with microservice architecture built with **TypeScript** that can run locally with Express and deploy to AWS using SAM template. Features AWS Cognito authentication with Lambda Authorizer for secure API access.

> **🎉 This project has been migrated to TypeScript!** See [TYPESCRIPT_MIGRATION.md](./TYPESCRIPT_MIGRATION.md) for migration details and benefits.

---

## 🔐 Authentication

This backend uses **AWS Cognito** for user authentication and **Lambda Authorizer** for API authorization. All API endpoints can be configured as protected or public.

**Key Features:**
- ✅ JWT token validation with Lambda Authorizer
- ✅ Token caching (5 min) for optimal performance
- ✅ User context injection in protected routes
- ✅ Public and protected endpoint support
- ✅ Mobile app ready with complete integration guide

**📚 Documentation:**
- **[Cognito Integration Guide](./COGNITO_INTEGRATION_GUIDE.md)** - Mobile app integration with code examples
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment instructions
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete implementation details

---

## Project Structure

```
├── src/                      # TypeScript source files
│   ├── authorizer/           # Lambda Authorizer for JWT validation
│   │   ├── authorizer.ts     # JWT validation logic (TypeScript)
│   │   └── package.json      # Authorizer dependencies
│   ├── controllers/          # Business logic for each service (*.ts)
│   ├── routes/               # Express route definitions (*.ts)
│   ├── handlers/             # AWS Lambda handler functions (*.ts)
│   ├── middlewares/          # Express middleware (*.ts)
│   ├── models/               # Data models and schemas (*.ts)
│   ├── services/             # Business service layer (*.ts)
│   ├── configs/              # Configuration files
│   ├── app.ts                # Express application setup
│   └── local.ts              # Local development server
├── dist/                     # Compiled JavaScript output (from TypeScript)
├── scripts/
│   ├── generate-endpoint.ts  # Script to auto-generate endpoint files (TypeScript)
│   ├── custom-build.ts       # Script to build microservice structure (TypeScript)
│   └── test-cognito-integration.js
├── build/                    # Generated build folders (per service)
│   ├── authorizer/           # Authorizer Lambda build
│   ├── user/                 # User microservice build
│   └── triggers/             # Trigger functions build
├── tsconfig.json             # TypeScript configuration
├── template.yaml             # AWS SAM template (includes Cognito & Authorizer)
├── samconfig.toml            # SAM deployment configuration
├── package.json              # Project dependencies
├── TYPESCRIPT_MIGRATION.md   # TypeScript migration guide
└── README.md                 # Project documentation
```

---

## Technologies

### Backend Framework
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript superset
- **Express.js** - Web application framework
- **aws-serverless-express** - Adapter for running Express in AWS Lambda

### Cloud & Deployment
- **AWS Lambda** - Serverless compute service
- **AWS API Gateway** - API management and routing
- **AWS Cognito** - User authentication and management
- **AWS SAM (Serverless Application Model)** - Infrastructure as Code
- **SAM CLI** - Deployment and testing tool

### Development Tools
- **Nodemon** - Auto-reload for local development
- **ts-node** - TypeScript execution engine
- **TypeScript Compiler** - Compiles TypeScript to JavaScript

---

## Adding New Endpoints

### 1. Generate Endpoint Files

Use the `generate-endpoint` script to automatically create all necessary TypeScript files:

```bash
npm run generate-endpoint <serviceName> <functionName> <method> <routePath>
```

#### Parameters:
- **serviceName**: Name of the service (e.g., `student`, `teacher`)
- **functionName**: Name of the function (e.g., `createStudent`, `getStudentById`)
- **method**: HTTP method (`GET`, `POST`, `PUT`, `DELETE`)
- **routePath**: Full API path (e.g., `/student`, `/student/:id`, `/teacher/name/:id`)

#### Examples:
```bash
# Create a new student (POST /student)
npm run generate-endpoint student createStudent POST /student

# Get student by ID (GET /student/:id)
npm run generate-endpoint student getStudentById GET /student/:id

# Update teacher (PUT /teacher/:id)
npm run generate-endpoint teacher updateTeacher PUT /teacher/:id

# Get teacher name by ID (GET /teacher/name/:id)
npm run generate-endpoint teacher getTeacherNameById GET /teacher/name/:id
```

#### What Gets Generated (TypeScript):
✅ Controller function in `src/controllers/{service}Controller.ts` with proper types
✅ Route definition in `src/routes/{service}Routes.ts` with Express types
✅ Lambda handler in `src/handlers/{service}Handler.ts` with AWS Lambda types
✅ Lambda function in `template.yaml`  
✅ Route registration in `src/app.ts` (if needed)

---

## Building Microservices

### Build Service-Specific Folder Structure

After generating endpoints, build the microservice folder structure:

```bash
# Build TypeScript first
npm run build

# Build for specific service
npm run custom-build -- user
```

#### What Gets Built:
This creates a `build/{service}/` folder containing:
- Compiled JavaScript from TypeScript
- Related controllers, routes, and handlers for the service
- Shared middlewares, models, services, and config files
- package.json and dependencies

#### Build Output Structure:
```
build/
└── user/
    ├── controllers/
    │   └── userController.js  (compiled from TypeScript)
    ├── routes/
    │   └── userRoutes.js      (compiled from TypeScript)
    ├── handlers/
    │   └── userHandler.js     (compiled from TypeScript)
    ├── middlewares/
    ├── models/
    ├── services/
    ├── configs/
    ├── package.json
    └── app.js
```

---

## Deployment Workflow

### Complete Steps:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```
   This compiles TypeScript from `src/` to JavaScript in `dist/`.

3. **Generate Endpoint** (if adding new endpoints)
   ```bash
   npm run generate-endpoint tutor createTutor POST /tutor
   ```
   This now generates TypeScript files with proper typing.

4. **Implement Business Logic**
   Edit `src/controllers/tutorController.ts` and add your logic with TypeScript types

5. **Rebuild TypeScript**
   ```bash
   npm run build
   ```

6. **Build Services**
   ```bash
   npm run custom-build -- user
   ```
   This builds the Lambda deployment packages from the compiled JavaScript.

7. **Deploy to AWS**
   ```bash
   sam build
   sam deploy --guided  # First time
   sam deploy           # Subsequent times
   ```

8. **Test Locally**
   ```bash
   npm run dev  # Auto-reloads on TypeScript changes
   ```

---

## 🔐 Authentication Flow

### Protected Endpoints (Require JWT Token)
```javascript
// Mobile app request
fetch('https://your-api.com/prod/tutor', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <cognito-jwt-token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ firstName: 'John', lastName: 'Doe' })
});
```

### Public Endpoints (No Auth Required)
```javascript
// No Authorization header needed
fetch('https://your-api.com/prod/health', {
  method: 'GET'
});
```

### In Controllers (Backend - TypeScript)
```typescript
import { Request, Response } from 'express';

// User info automatically available with proper types
export const createTutor = async (req: Request, res: Response): Promise<void> => {
  const { userId, email, name } = req.user;  // From Cognito (properly typed)
  // userId is Cognito sub - use as primary key
  const tutor = await TutorModel.create({
    tutorId: userId,
    email: email,
    ...req.body
  });
  res.status(201).json(tutor);
};
```

---

## License

ISC
