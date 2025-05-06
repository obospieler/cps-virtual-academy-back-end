import { Router, Request, Response, RequestHandler } from 'express';
import { HubController } from '../controllers/hub.controller';
import { SectionController } from '../controllers/section.controller';
import { PartnerSchoolController } from '../controllers/partnerSchool.controller';
import { SectionPartnerSchoolController } from '../controllers/sectionPartnerSchool.controller';
import { StudentEnrollController } from '../controllers/studentEnroll.controller';
import { StudentController } from '../controllers/student.controller';

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
 *           example: "Syncing records in background: 150"
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
router.post('/hubs', HubController.syncHubs as RequestHandler);

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
router.post('/sections', SectionController.syncSections as RequestHandler);

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
router.post('/partner-schools', PartnerSchoolController.syncPartnerSchools as unknown as RequestHandler);

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
router.post('/section-partner-schools', SectionPartnerSchoolController.syncSectionPartnerSchools as RequestHandler);

/**
 * @swagger
 * /sync/student-enrolled:
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
router.post('/student-enrolled', StudentEnrollController.syncStudentEnrolled as RequestHandler);


/**
 * @swagger
 * /sync/student:
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
router.post('/student', StudentController.syncStudent as RequestHandler);


export default router;

