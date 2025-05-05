import { Router, Request, Response } from 'express';
import { HubSyncController } from '../controllers/syncHub.controller';
import { ResponseUtil } from '../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     SyncHubRequest:
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
 *     SyncHubResponse:
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
 *           example: Syncing hubs in background: 150
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
 *             $ref: '#/components/schemas/SyncHubRequest'
 *     responses:
 *       200:
 *         description: Sync process started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncHubResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error message
 */
router.post('/hubs', async (req: Request, res: Response) => {
  await HubSyncController.syncHubs(req, res);
});

export default router; 