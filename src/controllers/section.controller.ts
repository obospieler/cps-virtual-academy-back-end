import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';
import { ResponseUtil } from '../utils/response.util';

export class SectionController {
    /**
     * Get all sections with pagination
     */
    static async getAllSections(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await SectionService.getAllSections(page, limit);
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Create a new section
     */
    static async createSection(req: Request, res: Response) {
        try {
            const section = await SectionService.createSection(req.body);
            res.status(201).json(ResponseUtil.success(section, 'Section created successfully', 201));
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
     * Get a section by ID
     */
    static async getSectionById(req: Request, res: Response) {
        try {
            const section = await SectionService.getSectionById(req.params.id);
            if (!section) {
                return res.status(404).json(ResponseUtil.notFound('Section not found'));
            }
            res.json(ResponseUtil.success(section));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get a section by Filemaker ID
     */
    static async getSectionByFilemakerId(req: Request, res: Response) {
        try {
            const section = await SectionService.getSectionByFilemakerId(req.params.id);
            if (!section) {
                return res.status(404).json(ResponseUtil.notFound('Section not found'));
            }
            res.json(ResponseUtil.success(section));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update a section
     */
    static async updateSection(req: Request, res: Response) {
        try {
            const section = await SectionService.updateSection(req.params.id, req.body);
            if (!section) {
                return res.status(404).json(ResponseUtil.notFound('Section not found'));
            }
            res.json(ResponseUtil.success(section, 'Section updated successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(400).json(ResponseUtil.error(err.message));
        }
    }

    /**
     * Delete a section
     */
    static async deleteSection(req: Request, res: Response) {
        try {
            const section = await SectionService.deleteSection(req.params.id);
            if (!section) {
                return res.status(404).json(ResponseUtil.notFound('Section not found'));
            }
            res.json(ResponseUtil.success(null, 'Section deleted successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get all sections for a hub
     */
    static async getSectionsByHub(req: Request, res: Response) {
        try {
            const sections = await SectionService.getSectionsByHub(req.params.hubId);
            res.json(ResponseUtil.success(sections));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Check section capacity
     */
    static async checkSectionCapacity(req: Request, res: Response) {
        try {
            const capacityInfo = await SectionService.checkSectionCapacity(req.params.id);
            res.json(ResponseUtil.success(capacityInfo));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update section enrollment
     */
    static async updateEnrollment(req: Request, res: Response) {
        try {
            const { change } = req.body;
            if (typeof change !== 'number') {
                return res.status(400).json(ResponseUtil.error('Change must be a number'));
            }
            const section = await SectionService.updateEnrollment(req.params.id, change);
            if (!section) {
                return res.status(404).json(ResponseUtil.notFound('Section not found'));
            }
            res.json(ResponseUtil.success(section, 'Enrollment updated successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(400).json(ResponseUtil.error(err.message));
        }
    }

    /**
     * Sync sections
     */
    static async syncSections(req: Request, res: Response) {
        const { date, purge } = req.body;
        const result = await SectionService.syncSections(date, purge);
        res.json(ResponseUtil.success({
            totalRecordsFound: result.totalRecords,
            message: "Sections are being synced in background"
        }));
    }

    /**
     * Get sections by partner school ID
     */
    static async getSectionsByPartnerSchool(req: Request, res: Response) {
        try {
            const partnerSchoolId = req.params.partnerSchoolId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await SectionService.getSectionsByPartnerSchool(
                partnerSchoolId,
                page,
                limit,
                search
            );
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }
} 