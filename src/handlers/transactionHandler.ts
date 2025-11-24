import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import awsServerlessExpress from 'aws-serverless-express';
import app from '../app';

const server = awsServerlessExpress.createServer(app);

export const getAllTransactionsHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
