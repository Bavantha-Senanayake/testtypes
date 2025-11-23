import { Response } from 'express';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

export const addCorsHeaders = (res: Response): Response => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.header(key, value);
  });
  return res;
};

export const formatResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});