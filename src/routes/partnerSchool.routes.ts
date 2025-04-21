import { Router } from 'express';
import { RequestHandler } from 'express';
import { PartnerSchoolController } from '../controllers/partnerSchool.controller';

/**
 * @swagger
 * components:
 *   schemas:
 *     PartnerSchool:
 *       type: object
 *       required:
 *         - ID
 *         - schoolName
 *         - CreationTimestamp
 *         - CreatedBy
 *         - ModificationTimestamp
 *         - ModifiedBy
 *       properties:
 *         ID:
 *           type: string
 *           description: The unique identifier for the partner school
 *           example: "E2D2EA81-433C-1D40-ADF5-1DC20AF7488C"
 *         xx_email_auth_user:
 *           type: string
 *           description: Email authentication user
 *           example: ""
 *         schoolName:
 *           type: string
 *           description: Name of the partner school
 *           example: "Oakmont"
 *         CreationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was created
 *           example: "01/24/2025 17:59:39"
 *         CreatedBy:
 *           type: string
 *           description: User who created the record
 *           example: "Admin"
 *         ModificationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was last modified
 *           example: "01/24/2025 17:59:44"
 *         ModifiedBy:
 *           type: string
 *           description: User who last modified the record
 *           example: "Admin"
 *         ModifiedByWeb:
 *           type: string
 *           description: Web user who modified the record
 *           example: ""
 */

const router = Router();

/**
 * @swagger
 * /partner-schools:
 *   get:
 *     summary: Get all partner schools with pagination
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of partner schools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     schools:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PartnerSchool'
 *                     total:
 *                       type: number
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/', PartnerSchoolController.getAllPartnerSchools as RequestHandler);

/**
 * @swagger
 * /partner-schools:
 *   post:
 *     summary: Create a new partner school
 *     tags: [Partner Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerSchool'
 *     responses:
 *       201:
 *         description: Partner school created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/PartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Partner school created successfully
 *       409:
 *         description: Partner school with this ID already exists
 */
router.post('/', PartnerSchoolController.createPartnerSchool as RequestHandler);

/**
 * @swagger
 * /partner-schools/{id}:
 *   get:
 *     summary: Get partner school by ID
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     responses:
 *       200:
 *         description: Partner school details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/PartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       404:
 *         description: Partner school not found
 */
router.get('/:id', PartnerSchoolController.getPartnerSchoolById as RequestHandler);

/**
 * @swagger
 * /partner-schools/{id}:
 *   patch:
 *     summary: Update partner school
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerSchool'
 *     responses:
 *       200:
 *         description: Partner school updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/PartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Partner school updated successfully
 *       404:
 *         description: Partner school not found
 *       409:
 *         description: Partner school with this ID already exists
 */
router.patch('/:id', PartnerSchoolController.updatePartnerSchool as RequestHandler);

/**
 * @swagger
 * /partner-schools/{id}:
 *   delete:
 *     summary: Delete partner school
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     responses:
 *       200:
 *         description: Partner school deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: Partner school deleted successfully
 *       404:
 *         description: Partner school not found
 */
router.delete('/:id', PartnerSchoolController.deletePartnerSchool as RequestHandler);

/**
 * @swagger
 * /partner-schools/search/{query}:
 *   get:
 *     summary: Search partner schools
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (school name or ID)
 *     responses:
 *       200:
 *         description: List of matching partner schools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/search/:query', PartnerSchoolController.searchPartnerSchools as RequestHandler);

/**
 * @swagger
 * /partner-schools/email-auth/{email}:
 *   get:
 *     summary: Get partner schools by email auth
 *     tags: [Partner Schools]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email auth user
 *     responses:
 *       200:
 *         description: List of partner schools for the email auth user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/email-auth/:email', PartnerSchoolController.getPartnerSchoolsByEmailAuth as RequestHandler);

export default router; 