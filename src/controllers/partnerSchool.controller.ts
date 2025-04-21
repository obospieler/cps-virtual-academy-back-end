import { Request, Response } from 'express';
import { PartnerSchoolService } from '../services/partnerSchool.service';
import { ResponseUtil } from '../utils/response.util';

export class PartnerSchoolController {
    /**
     * Get all partner schools with pagination
     */
    static async getAllPartnerSchools(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await PartnerSchoolService.getAllPartnerSchools(page, limit);
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Create a new partner school
     */
    static async createPartnerSchool(req: Request, res: Response) {
        try {
            const school = await PartnerSchoolService.createPartnerSchool(req.body);
            res.status(201).json(ResponseUtil.success(school, 'Partner school created successfully', 201));
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(err.message, 409));
            } else {
                res.status(400).json(ResponseUtil.error(err.message));
            }
        }
    }

    /**
     * Get a partner school by ID
     */
    static async getPartnerSchoolById(req: Request, res: Response) {
        try {
            const school = await PartnerSchoolService.getPartnerSchoolById(req.params.id);
            if (!school) {
                return res.status(404).json(ResponseUtil.notFound('Partner school not found'));
            }
            res.json(ResponseUtil.success(school));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update a partner school
     */
    static async updatePartnerSchool(req: Request, res: Response) {
        try {
            const school = await PartnerSchoolService.updatePartnerSchool(req.params.id, req.body);
            if (!school) {
                return res.status(404).json(ResponseUtil.notFound('Partner school not found'));
            }
            res.json(ResponseUtil.success(school, 'Partner school updated successfully'));
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('already exists')) {
                res.status(409).json(ResponseUtil.error(err.message, 409));
            } else {
                res.status(400).json(ResponseUtil.error(err.message));
            }
        }
    }

    /**
     * Delete a partner school
     */
    static async deletePartnerSchool(req: Request, res: Response) {
        try {
            const school = await PartnerSchoolService.deletePartnerSchool(req.params.id);
            if (!school) {
                return res.status(404).json(ResponseUtil.notFound('Partner school not found'));
            }
            res.json(ResponseUtil.success(null, 'Partner school deleted successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Search for partner schools
     */
    static async searchPartnerSchools(req: Request, res: Response) {
        try {
            const schools = await PartnerSchoolService.searchPartnerSchools(req.params.query);
            res.json(ResponseUtil.success(schools));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get partner schools by email auth
     */
    static async getPartnerSchoolsByEmailAuth(req: Request, res: Response) {
        try {
            const schools = await PartnerSchoolService.getPartnerSchoolsByEmailAuth(req.params.email);
            res.json(ResponseUtil.success(schools));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }
} 