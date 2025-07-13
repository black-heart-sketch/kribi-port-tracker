import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kribi Port Authority API',
      version,
      description: 'API documentation for Kribi Port Authority System',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Kribi Port Authority',
        url: 'https://kribiport.cm',
        email: 'info@kribiport.cm',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.kribiport.cm',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        BadRequest: {
          description: 'Bad request. Invalid input data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation failed' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string', example: 'email' },
                        message: { type: 'string', example: 'Email is required' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
        },
        ServerError: {
          description: 'Internal server error',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Docs in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
};

export default swaggerDocs;

// Example usage in server.js:
// import swaggerDocs from './utils/swagger';
// 
// // ... other imports and middleware
// 
// // Swagger documentation
// if (process.env.NODE_ENV === 'development') {
//   swaggerDocs(app, port);
// }
