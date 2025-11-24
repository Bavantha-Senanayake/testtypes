import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import awsServerlessExpress from 'aws-serverless-express';
import app from '../app';

const server = awsServerlessExpress.createServer(app);

export const addFabricHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const updateFabricHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const deleteFabricHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const getFabricHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const getAllFabricsHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export const issueFabricHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
