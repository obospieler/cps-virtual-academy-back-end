import { Request, Response } from 'express';
import { StudentEnrollService } from '../services/studentEnroll.service';
import { ResponseUtil } from '../utils/response.util';

export class StudentEnrollController {
    /**
     * Get all student enrollments with pagination
     */
    static async getAllEnrollments(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const { enrollments, total } = await StudentEnrollService.getAllEnrollments(page, limit);
            
            res.status(200).json(ResponseUtil.success({
                enrollments,
                total
            }));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch student enrollments'));
        }
    }

    /**
     * Create a new student enrollment
     */
    static async createEnrollment(req: Request, res: Response): Promise<void> {
        try {
            const enrollment = await StudentEnrollService.createEnrollment(req.body);
            res.status(201).json(ResponseUtil.success(enrollment, 'Student enrollment created successfully', 201));
        } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(error.message, 409));
            } else {
                res.status(500).json(ResponseUtil.serverError('Failed to create student enrollment'));
            }
        }
    }

    /**
     * Get a student enrollment by ID
     */
    static async getEnrollmentById(req: Request, res: Response): Promise<void> {
        try {
            const enrollment = await StudentEnrollService.getEnrollmentById(req.params.id);
            
            if (!enrollment) {
                res.status(404).json(ResponseUtil.notFound('Student enrollment not found'));
                return;
            }
            
            res.status(200).json(ResponseUtil.success(enrollment));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch student enrollment'));
        }
    }

    /**
     * Update a student enrollment
     */
    static async updateEnrollment(req: Request, res: Response): Promise<void> {
        try {
            const enrollment = await StudentEnrollService.updateEnrollment(req.params.id, req.body);
            
            if (!enrollment) {
                res.status(404).json(ResponseUtil.notFound('Student enrollment not found'));
                return;
            }
            
            res.status(200).json(ResponseUtil.success(enrollment, 'Student enrollment updated successfully'));
        } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(error.message, 409));
            } else {
                res.status(500).json(ResponseUtil.serverError('Failed to update student enrollment'));
            }
        }
    }

    /**
     * Delete a student enrollment
     */
    static async deleteEnrollment(req: Request, res: Response): Promise<void> {
        try {
            const enrollment = await StudentEnrollService.deleteEnrollment(req.params.id);
            
            if (!enrollment) {
                res.status(404).json(ResponseUtil.notFound('Student enrollment not found'));
                return;
            }
            
            res.status(200).json(ResponseUtil.success(null, 'Student enrollment deleted successfully'));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to delete student enrollment'));
        }
    }

    /**
     * Get enrollments by hub ID
     */
    static async getEnrollmentsByHub(req: Request, res: Response): Promise<void> {
        try {
            const enrollments = await StudentEnrollService.getEnrollmentsByHub(req.params.hubId);
            res.status(200).json(ResponseUtil.success(enrollments));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch enrollments by hub'));
        }
    }

    /**
     * Get enrollments by partner school ID
     */
    static async getEnrollmentsByPartnerSchool(req: Request, res: Response): Promise<void> {
        try {
            const enrollments = await StudentEnrollService.getEnrollmentsByPartnerSchool(req.params.partnerSchoolId);
            res.status(200).json(ResponseUtil.success(enrollments));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch enrollments by partner school'));
        }
    }

    /**
     * Get enrollments by section ID
     */
    static async getEnrollmentsBySection(req: Request, res: Response): Promise<void> {
        try {
            const enrollments = await StudentEnrollService.getEnrollmentsBySection(req.params.sectionId);
            res.status(200).json(ResponseUtil.success(enrollments));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch enrollments by section'));
        }
    }

    /**
     * Get enrollments by student ID
     */
    static async getEnrollmentsByStudent(req: Request, res: Response): Promise<void> {
        try {
            const enrollments = await StudentEnrollService.getEnrollmentsByStudent(req.params.studentId);
            res.status(200).json(ResponseUtil.success(enrollments));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to fetch enrollments by student'));
        }
    }

    /**
     * Search enrollments
     */
    static async searchEnrollments(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                res.status(400).json(ResponseUtil.error('Search query is required'));
                return;
            }
            
            const enrollments = await StudentEnrollService.searchEnrollments(query);
            res.status(200).json(ResponseUtil.success(enrollments));
        } catch (error) {
            res.status(500).json(ResponseUtil.serverError('Failed to search enrollments'));
        }
    }

     /**
     * Sync hubs
     */
     static async syncStudentEnrolled(req: Request, res: Response) {
        const { date, purge } = req.body;
        const result = await StudentEnrollService.syncStudentEnrolled(date, purge);
        res.json(ResponseUtil.success({
            totalRecordsFound: result.totalRecords,
            message: "Hubs are being synced in background"
        }));
    }
} 