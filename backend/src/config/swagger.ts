/**
 * Swagger/OpenAPI Configuration
 * Generates interactive API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { getEnv } from './validate-env';

const env = getEnv();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EduHub API Documentation',
    version: process.env.APP_VERSION || '1.0.0',
    description: `
      ## Personalized Content Aggregation API

      This API provides endpoints for content aggregation, user management,
      recommendations, and analytics for the EduHub platform.

      ### Features
      - 🔐 JWT-based authentication
      - 📊 Content aggregation from multiple sources
      - 🎯 Personalized recommendations
      - 📈 Analytics and insights
      - 🔍 Advanced search capabilities

      ### Rate Limiting
      Most endpoints are rate-limited to ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 60000} minutes.
    `,
    contact: {
      name: 'API Support',
      email: 'support@eduhub.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Development server',
    },
    {
      url: 'https://api.eduhub.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT token stored in HTTP-only cookie',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Error message',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          username: {
            type: 'string',
          },
          fullName: {
            type: 'string',
            nullable: true,
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          isAdmin: {
            type: 'boolean',
          },
          emailVerified: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          icon: {
            type: 'string',
            nullable: true,
          },
          isDefault: {
            type: 'boolean',
          },
        },
      },
      Content: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          url: {
            type: 'string',
            format: 'uri',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          contentType: {
            type: 'string',
            enum: ['video', 'article', 'paper', 'blog', 'podcast'],
          },
          source: {
            type: 'string',
          },
          author: {
            type: 'string',
            nullable: true,
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          qualityScore: {
            type: 'number',
            format: 'float',
            minimum: 0,
            maximum: 1,
          },
          popularityScore: {
            type: 'number',
            format: 'float',
          },
          category: {
            $ref: '#/components/schemas/Category',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Unauthorized - Please log in',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Forbidden - Admin access required',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Validation failed',
              details: [
                {
                  field: 'email',
                  message: 'Invalid email format',
                },
              ],
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Categories',
      description: 'Category management endpoints',
    },
    {
      name: 'Content',
      description: 'Content browsing and interaction endpoints',
    },
    {
      name: 'Search',
      description: 'Search and discovery endpoints',
    },
    {
      name: 'Analytics',
      description: 'User analytics and insights endpoints',
    },
    {
      name: 'Admin',
      description: 'Admin-only endpoints (requires admin role)',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Path to API routes with JSDoc comments
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/middleware/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
