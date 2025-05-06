import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CPS Virtual Academy API Documentation',
      version,
      description: 'API documentation for CPS Virtual Academy backend services',
      contact: {
        name: 'CPS Virtual Academy Team',
        email: 'support@cpsvirtualacademy.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'] // Path to the API routes and models
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: any, port: number) {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${port}/api-docs`);
}

export default swaggerDocs; 