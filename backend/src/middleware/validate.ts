/**
 * Validation Middleware
 * Validates request body, query, and params against Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';
import { HTTP_STATUS } from '../constants';
import logger from '../utils/logger';

/**
 * Validate request against Zod schema
 * @param schema Zod schema to validate against
 * @param source Which part of request to validate ('body' | 'query' | 'params')
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' | 'all' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;

      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'all':
          dataToValidate = {
            ...req.body,
            ...req.query,
            ...req.params,
          };
          break;
      }

      // Parse and validate
      const validated = await schema.parseAsync(dataToValidate);

      // Replace request data with validated (and transformed) data
      switch (source) {
        case 'body':
          req.body = validated;
          break;
        case 'query':
          req.query = validated;
          break;
        case 'params':
          req.params = validated;
          break;
        case 'all':
          // Split validated data back into body, query, and params
          // This is a simplified version - you might want more sophisticated logic
          req.body = validated;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation error', {
          path: req.path,
          method: req.method,
          errors,
        });

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors,
          },
        });
      }

      next(error);
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: AnyZodObject) => validate(schema, 'body');

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: AnyZodObject) => validate(schema, 'query');

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: AnyZodObject) => validate(schema, 'params');

/**
 * Validate all parts of the request (body + query + params)
 */
export const validateAll = (schema: AnyZodObject) => validate(schema, 'all');
