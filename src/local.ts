// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

// Environment variables will be automatically loaded from .env
// No need to set them manually as below:
// process.env.TUTORS_TABLE = 'testTable';
// process.env.AWS_REGION_NAME = 'us-east-1';
// process.env.NODE_ENV = 'development';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
  console.log(`Connected to DynamoDB Table: ${process.env.TABLE_NAME}`);
  console.log(`AWS Region: ${process.env.AWS_REGION_NAME}`);
});
