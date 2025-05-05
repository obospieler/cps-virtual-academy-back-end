import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/user.routes';
import hubroutes from './routes/hub.routes';
import errorMiddleware from './middleware/error.middleware';
import swaggerDocs from './config/swagger';
import sectionroutes from './routes/section.routes';
import studentroutes from './routes/student.routes';
import sectionPartnerSchoolroutes from './routes/sectionPartnerSchool.routes';
import partnerschoolroutes from './routes/partnerSchool.routes';
import syncRoutes from './routes/sync.routes';

// Load environment variables
config();

// Initialize express app
const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to Database
connectDB();

// Initialize Swagger
const PORT = Number(process.env.PORT) || 3000;
swaggerDocs(app, PORT);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/hubs', hubroutes);
app.use('/api/sections', sectionroutes);
app.use('/api/students', studentroutes);
app.use('/api/section-partner-schools', sectionPartnerSchoolroutes);
app.use('/api/partner-schools', partnerschoolroutes);
app.use('/api/sync', syncRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorMiddleware);

export default app;