"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Get command line arguments
const args = process.argv.slice(2);
const serviceName = args[0]; // e.g., 'student', 'teacher'
const functionName = args[1]; // e.g., 'createStudent', 'getStudent'
const method = args[2]; // e.g., 'GET', 'POST', 'PUT', 'DELETE'
const routePath = args[3] || `/${serviceName}`; // e.g., '/student' or '/student/:id'
if (!serviceName || !functionName || !method) {
    console.error('Usage: ts-node scripts/generate-endpoint.ts <serviceName> <functionName> <method> [routePath]');
    console.error('Example: ts-node scripts/generate-endpoint.ts student createStudent POST /student');
    process.exit(1);
}
const srcFolder = path.join(__dirname, '..', 'src');
const controllersFolder = path.join(srcFolder, 'controllers');
const routesFolder = path.join(srcFolder, 'routes');
const handlersFolder = path.join(srcFolder, 'handlers');
const templatePath = path.join(__dirname, '..', 'template.yaml');
// Helper function to capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Helper function to convert camelCase to PascalCase
function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// 1. Add controller function
function addControllerFunction() {
    const controllerFile = path.join(controllersFolder, `${serviceName}Controller.ts`);
    const statusCode = method === 'POST' ? 201 : 200;
    const responseMessage = `${functionName} executed successfully`;
    const controllerFunction = `
export const ${functionName} = async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement ${functionName} logic
  const data = req.body || {};
  
  res.status(${statusCode}).json({
    message: '${responseMessage}',
    data: data,
    timestamp: new Date().toISOString()
  });
};
`;
    if (fs.existsSync(controllerFile)) {
        fs.appendFileSync(controllerFile, controllerFunction);
        console.log(`✓ Added ${functionName} to ${serviceName}Controller.ts`);
    }
    else {
        const fullControllerContent = `import { Request, Response } from 'express';
${controllerFunction}`;
        fs.writeFileSync(controllerFile, fullControllerContent);
        console.log(`✓ Created ${serviceName}Controller.ts with ${functionName}`);
    }
}
// 2. Add route
function addRoute() {
    const routeFile = path.join(routesFolder, `${serviceName}Routes.ts`);
    const httpMethod = method.toLowerCase();
    // Extract the path after the service name
    const basePath = `/${serviceName}`;
    let actualRoutePath = '/';
    if (routePath.startsWith(basePath)) {
        actualRoutePath = routePath.substring(basePath.length);
        if (!actualRoutePath || actualRoutePath === '') {
            actualRoutePath = '/';
        }
    }
    else if (routePath.startsWith('/')) {
        actualRoutePath = routePath;
    }
    if (fs.existsSync(routeFile)) {
        let routeContent = fs.readFileSync(routeFile, 'utf-8');
        // Check if route already exists
        if (routeContent.includes(`router.${httpMethod}('${actualRoutePath}', ${serviceName}Controller.${functionName})`)) {
            console.log(`⚠ Route already exists in ${serviceName}Routes.ts`);
            return;
        }
        // Add new route before export default
        const newRoute = `router.${httpMethod}('${actualRoutePath}', ${serviceName}Controller.${functionName});\n`;
        routeContent = routeContent.replace('export default router;', `${newRoute}\nexport default router;`);
        fs.writeFileSync(routeFile, routeContent);
        console.log(`✓ Added ${httpMethod.toUpperCase()} ${actualRoutePath} route to ${serviceName}Routes.ts`);
    }
    else {
        const routeContent = `import express from 'express';
import * as ${serviceName}Controller from '../controllers/${serviceName}Controller';

const router = express.Router();

router.${httpMethod}('${actualRoutePath}', ${serviceName}Controller.${functionName});

export default router;
`;
        fs.writeFileSync(routeFile, routeContent);
        console.log(`✓ Created ${serviceName}Routes.ts with ${httpMethod.toUpperCase()} ${actualRoutePath} route`);
    }
}
// 3. Add handler function
function addHandlerFunction() {
    const handlerFile = path.join(handlersFolder, `${serviceName}Handler.ts`);
    const handlerFunctionName = `${functionName}Handler`;
    const handlerFunction = `
export const ${handlerFunctionName} = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
`;
    if (fs.existsSync(handlerFile)) {
        let handlerContent = fs.readFileSync(handlerFile, 'utf-8');
        // Check if handler already exists
        if (handlerContent.includes(`export const ${handlerFunctionName}`)) {
            console.log(`⚠ Handler ${handlerFunctionName} already exists in ${serviceName}Handler.ts`);
            return;
        }
        fs.appendFileSync(handlerFile, handlerFunction);
        console.log(`✓ Added ${handlerFunctionName} to ${serviceName}Handler.ts`);
    }
    else {
        const fullHandlerContent = `import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import awsServerlessExpress from 'aws-serverless-express';
import app from '../app';

const server = awsServerlessExpress.createServer(app);
${handlerFunction}`;
        fs.writeFileSync(handlerFile, fullHandlerContent);
        console.log(`✓ Created ${serviceName}Handler.ts with ${handlerFunctionName}`);
    }
}
// 4. Add function to template.yaml
function addTemplateFunction() {
    let templateContent = fs.readFileSync(templatePath, 'utf-8');
    const lambdaFunctionName = `${toPascalCase(functionName)}Function`;
    const handlerFunctionName = `${functionName}Handler`;
    // Check if function already exists
    if (templateContent.includes(`${lambdaFunctionName}:`)) {
        console.log(`⚠ Lambda function ${lambdaFunctionName} already exists in template.yaml`);
        return;
    }
    const lambdaFunction = `
  ${lambdaFunctionName}:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./build/${serviceName}/
      Handler: handlers/${serviceName}Handler.${handlerFunctionName}
      Role: !GetAtt LambdaExecutionRole.Arn
      Events:
        ${toPascalCase(functionName)}:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGatewayApi
            Path: ${routePath}
            Method: ${method.toUpperCase()}
           
`;
    // Insert before Outputs section
    if (templateContent.includes('Outputs:')) {
        templateContent = templateContent.replace('Outputs:', `${lambdaFunction}\nOutputs:`);
    }
    else {
        templateContent += lambdaFunction;
    }
    fs.writeFileSync(templatePath, templateContent);
    console.log(`✓ Added ${lambdaFunctionName} to template.yaml`);
}
// 5. Ensure service is registered in app.ts
function ensureAppRegistration() {
    const appFile = path.join(srcFolder, 'app.ts');
    let appContent = fs.readFileSync(appFile, 'utf-8');
    const routeImport = `import ${serviceName}Routes from './routes/${serviceName}Routes';`;
    const routeUse = `app.use('/${serviceName}', ${serviceName}Routes);`;
    // Check if route is already registered
    if (appContent.includes(routeImport) && appContent.includes(routeUse)) {
        console.log(`✓ ${serviceName} routes already registered in app.ts`);
        return;
    }
    // Add import if missing
    if (!appContent.includes(routeImport)) {
        // Find the last import statement and add after it
        const lines = appContent.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('import ')) {
                lastImportIndex = i;
            }
        }
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, routeImport);
            appContent = lines.join('\n');
        }
    }
    // Add route use if missing
    if (!appContent.includes(routeUse)) {
        // Add before export default
        appContent = appContent.replace('export default app;', `${routeUse}\n\nexport default app;`);
    }
    fs.writeFileSync(appFile, appContent);
    console.log(`✓ Registered ${serviceName} routes in app.ts`);
}
// Execute all steps
console.log(`\n🚀 Generating endpoint: ${method} ${routePath} (${functionName})\n`);
try {
    addControllerFunction();
    addRoute();
    addHandlerFunction();
    addTemplateFunction();
    ensureAppRegistration();
    console.log(`\n✅ Successfully generated all files for ${functionName}!`);
    console.log(`\nNext steps:`);
    console.log(`1. Implement the logic in src/controllers/${serviceName}Controller.ts`);
    console.log(`2. Run: npm run build`);
    console.log(`3. Run: npm run custom-build -- ${serviceName}`);
    console.log(`4. Run: sam build && sam deploy`);
    console.log(`5. Test locally: npm run dev\n`);
}
catch (error) {
    console.error(`\n❌ Error generating endpoint:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
}
//# sourceMappingURL=generate-endpoint.js.map