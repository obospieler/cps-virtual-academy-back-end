import { Request, Response } from 'express';
import { HubService } from '../services/hub.service';
import { ResponseUtil } from '../utils/response.util';

export class HubController {
    /**
     * Get all hubs with pagination
     */
    static async getAllHubs(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await HubService.getAllHubs(page, limit);
            res.json(ResponseUtil.success(result));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Create a new hub
     */
    static async createHub(req: Request, res: Response) {
        try {
            const hub = await HubService.createHub(req.body);
            res.status(201).json(ResponseUtil.success(hub, 'Hub created successfully', 201));
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
     * Get a hub by ID
     */
    static async getHubById(req: Request, res: Response) {
        try {
            const hub = await HubService.getHubById(req.params.id);
            if (!hub) {
                return res.status(404).json(ResponseUtil.notFound('Hub not found'));
            }
            res.json(ResponseUtil.success(hub));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Update a hub
     */
    static async updateHub(req: Request, res: Response) {
        try {
            const hub = await HubService.updateHub(req.params.id, req.body);
            if (!hub) {
                return res.status(404).json(ResponseUtil.notFound('Hub not found'));
            }
            res.json(ResponseUtil.success(hub, 'Hub updated successfully'));
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
     * Delete a hub
     */
    static async deleteHub(req: Request, res: Response) {
        try {
            const hub = await HubService.deleteHub(req.params.id);
            if (!hub) {
                return res.status(404).json(ResponseUtil.notFound('Hub not found'));
            }
            res.json(ResponseUtil.success(null, 'Hub deleted successfully'));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get hubs by umbrella
     */
    static async getHubsByUmbrella(req: Request, res: Response) {
        try {
            const hubs = await HubService.getHubsByUmbrella(req.params.umbrella);
            res.json(ResponseUtil.success(hubs));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Get hubs by course
     */
    static async getHubsByCourse(req: Request, res: Response) {
        try {
            const hubs = await HubService.getHubsByCourse(req.params.course);
            res.json(ResponseUtil.success(hubs));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }

    /**
     * Search for hubs
     */
    static async searchHubs(req: Request, res: Response) {
        try {
            const hubs = await HubService.searchHubs(req.params.query);
            res.json(ResponseUtil.success(hubs));
        } catch (error) {
            const err = error as Error;
            res.status(500).json(ResponseUtil.serverError(err.message));
        }
    }
} 