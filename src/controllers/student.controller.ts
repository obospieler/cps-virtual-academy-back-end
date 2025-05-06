import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';
import { ResponseUtil } from '../utils/response.util';

export class StudentController {
    /**
     * Get all students with pagination
     */
    static async getAllStudents(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await StudentService.getAllStudents(page, limit);
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Create a new student
     */
    static async createStudent(req: Request, res: Response) {
        try {
            const student = await StudentService.createStudent(req.body);
            res.status(201).json(ResponseUtil.success(student, 'Student created successfully', 201));
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(err.message, 409));
            } else {
                res.status(500).json(ResponseUtil.serverError(err.message));
            }
        }
    }

    /**
     * Get a student by ID or CPSID
     */
    static async getStudentById(req: Request, res: Response) {
        try {
            const student = await StudentService.getStudentById(req.params.id);
            if (!student) {
                return res.status(404).json(ResponseUtil.notFound('Student not found'));
            }
            res.json(ResponseUtil.success(student));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update a student
     */
    static async updateStudent(req: Request, res: Response) {
        try {
            const student = await StudentService.updateStudent(req.params.id, req.body);
            if (!student) {
                return res.status(404).json(ResponseUtil.notFound('Student not found'));
            }
            res.json(ResponseUtil.success(student, 'Student updated successfully'));
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(err.message, 409));
            } else {
                res.status(500).json(ResponseUtil.serverError(err.message));
            }
        }
    }

    /**
     * Delete a student
     */
    static async deleteStudent(req: Request, res: Response) {
        try {
            const student = await StudentService.deleteStudent(req.params.id);
            if (!student) {
                return res.status(404).json(ResponseUtil.notFound('Student not found'));
            }
            res.json(ResponseUtil.success(student, 'Student deleted successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Search for students
     */
    static async searchStudents(req: Request, res: Response) {
        try {
            const students = await StudentService.searchStudents(req.params.query);
            res.json(ResponseUtil.success(students));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get students by partner school
     */
    static async getStudentsByPartnerSchool(req: Request, res: Response) {
        try {
            const students = await StudentService.getStudentsByPartnerSchool(req.params.partnerSchoolId);
            res.json(ResponseUtil.success(students));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update student eligibility flags
     */
    static async updateEligibility(req: Request, res: Response) {
        try {
            const student = await StudentService.updateEligibility(req.params.id, req.body);
            if (!student) {
                return res.status(404).json(ResponseUtil.notFound('Student not found'));
            }
            res.json(ResponseUtil.success(student, 'Eligibility updated successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Sync sections
     */
    static async syncStudent(req: Request, res: Response) {
        const { date, purge } = req.body;
        const result = await StudentService.syncStudent(date, purge);
        res.json(ResponseUtil.success({
            totalRecordsFound: result.totalRecords,
            message: "Sections are being synced in background"
        }));
    }
       
} 