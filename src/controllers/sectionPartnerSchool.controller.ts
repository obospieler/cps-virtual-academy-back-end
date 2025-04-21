import { Request, Response } from 'express';
import { SectionPartnerSchoolService } from '../services/sectionPartnerSchool.service';
import { ResponseUtil } from '../utils/response.util';

export class SectionPartnerSchoolController {
    /**
     * Get all section partner school relationships with pagination
     */
    static async getAllSectionPartnerSchools(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await SectionPartnerSchoolService.getAllSectionPartnerSchools(page, limit);
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Create a new section partner school relationship
     */
    static async createSectionPartnerSchool(req: Request, res: Response) {
        try {
            const relationship = await SectionPartnerSchoolService.createSectionPartnerSchool(req.body);
            res.status(201).json(ResponseUtil.success(relationship, 'Relationship created successfully', 201));
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
     * Get a section partner school relationship by ID or recordId
     */
    static async getSectionPartnerSchoolById(req: Request, res: Response) {
        try {
            const relationship = await SectionPartnerSchoolService.getSectionPartnerSchoolById(req.params.id);
            if (!relationship) {
                return res.status(404).json(ResponseUtil.notFound('Section partner school relationship not found'));
            }
            res.json(ResponseUtil.success(relationship));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update a section partner school relationship
     */
    static async updateSectionPartnerSchool(req: Request, res: Response) {
        try {
            const relationship = await SectionPartnerSchoolService.updateSectionPartnerSchool(req.params.id, req.body);
            if (!relationship) {
                return res.status(404).json(ResponseUtil.notFound('Section partner school relationship not found'));
            }
            res.json(ResponseUtil.success(relationship, 'Relationship updated successfully'));
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
     * Delete a section partner school relationship
     */
    static async deleteSectionPartnerSchool(req: Request, res: Response) {
        try {
            const relationship = await SectionPartnerSchoolService.deleteSectionPartnerSchool(req.params.id);
            if (!relationship) {
                return res.status(404).json(ResponseUtil.notFound('Section partner school relationship not found'));
            }
            res.json(ResponseUtil.success(relationship, 'Relationship deleted successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get all relationships for a specific section
     */
    static async getRelationshipsBySection(req: Request, res: Response) {
        try {
            const relationships = await SectionPartnerSchoolService.getRelationshipsBySection(req.params.sectionId);
            res.json(ResponseUtil.success(relationships));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get all relationships for a specific partner school
     */
    static async getRelationshipsByPartnerSchool(req: Request, res: Response) {
        try {
            const relationships = await SectionPartnerSchoolService.getRelationshipsByPartnerSchool(req.params.partnerSchoolId);
            res.json(ResponseUtil.success(relationships));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update enrollment numbers for a relationship
     */
    static async updateEnrollment(req: Request, res: Response) {
        try {
            const { numEnrolled, numRoster } = req.body;
            const relationship = await SectionPartnerSchoolService.updateEnrollment(req.params.id, numEnrolled, numRoster);
            if (!relationship) {
                return res.status(404).json(ResponseUtil.notFound('Section partner school relationship not found'));
            }
            res.json(ResponseUtil.success(relationship, 'Enrollment updated successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }
} 