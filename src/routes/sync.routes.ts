import { Router, Request, Response } from 'express';
import { HubSyncController } from '../controllers/syncHub.controller';
import { SectionSyncController } from '../controllers/syncSection.controller';
import { PartnerSchoolSyncController } from '../controllers/syncPartnerSchool.controller';
import { SectionPartnerSchoolSyncController } from '../controllers/syncSectionPartnerSchool.controller';
import { ResponseUtil } from '../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     SyncRequest:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Optional date in MMDDYYYY format to sync records modified after this date
 *           example: "01012025"
 *         purge:
 *           type: boolean
 *           description: If true, will delete all existing records before syncing
 *           example: false
 *     SyncResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         code:
 *           type: number
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             total_count:
 *               type: number
 *               description: Total number of records being synced
 *               example: 150
 *         message:
 *           type: string
 *           example: Syncing records in background: 150
 */

const router = Router();

/**
 * @swagger
 * /sync/hubs:
 *   post:
 *     summary: Sync hubs from FileMaker to MongoDB
 *     tags: [Sync]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncRequest'
 *           example:
 *             date: "01012025"
 *             purge: false
 *     responses:
 *       200:
 *         description: Sync process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *       500:
 *         description: Server error
 */
router.post('/hubs', async (req: Request, res: Response) => {
  await HubSyncController.syncHubs(req, res);
});

/**
 * @swagger
 * /sync/sections:
 *   post:
 *     summary: Sync sections from FileMaker to MongoDB
 *     tags: [Sync]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncRequest'
 *           example:
 *             date: "01012025"
 *             purge: false
 *     responses:
 *       200:
 *         description: Sync process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *       500:
 *         description: Server error
 */
router.post('/sections', async (req: Request, res: Response) => {
  await SectionSyncController.syncSections(req, res);
});

/**
 * @swagger
 * /sync/partner-schools:
 *   post:
 *     summary: Sync partner schools from FileMaker to MongoDB
 *     tags: [Sync]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncRequest'
 *           example:
 *             date: "01012025"
 *             purge: false
 *     responses:
 *       200:
 *         description: Sync process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *       500:
 *         description: Server error
 */
router.post('/partner-schools', async (req: Request, res: Response) => {
  await PartnerSchoolSyncController.syncPartnerSchools(req, res);
});

/**
 * @swagger
 * /sync/section-partner-schools:
 *   post:
 *     summary: Sync section-partner school relationships from FileMaker to MongoDB
 *     tags: [Sync]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncRequest'
 *           example:
 *             date: "01012025"
 *             purge: false
 *     responses:
 *       200:
 *         description: Sync process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *       500:
 *         description: Server error
 */
router.post('/section-partner-schools', async (req: Request, res: Response) => {
  await SectionPartnerSchoolSyncController.syncSectionPartnerSchools(req, res);
});

export default router;