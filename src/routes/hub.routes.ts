import { Router, Request, Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { HubController } from '../controllers/hub.controller';
import { ResponseUtil } from '../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     Hub:
 *       type: object
 *       required:
 *         - ID
 *         - CreationTimestamp
 *         - CreatedBy
 *         - ModificationTimestamp
 *         - ModifiedBy
 *         - umbrella
 *         - course
 *         - name
 *       properties:
 *         ID:
 *           type: string
 *           description: The unique identifier for the hub
 *           example: "3AF80968-A3AE-684E-AEBB-B72BD9876E00"
 *         CreationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was created
 *           example: "01/24/2025 18:03:18"
 *         CreatedBy:
 *           type: string
 *           description: User who created the record
 *           example: "Admin"
 *         ModificationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was last modified
 *           example: "04/09/2025 15:27:20"
 *         ModifiedBy:
 *           type: string
 *           description: User who last modified the record
 *           example: "kristen"
 *         umbrella:
 *           type: string
 *           description: The umbrella category
 *           example: "MG"
 *         course:
 *           type: string
 *           description: The course name
 *           example: "Algebra"
 *         name:
 *           type: string
 *           description: The hub name
 *           example: "MG Algebra"
 *         classModel:
 *           type: string
 *           description: The class model
 *           example: ""
 *         date_start:
 *           type: string
 *           description: Start date
 *           example: ""
 *         date_end:
 *           type: string
 *           description: End date
 *           example: ""
 *         ModifiedByWeb:
 *           type: string
 *           description: Web user who modified the record
 *           example: ""
 */

const router = Router();

/**
 * @swagger
 * /hubs:
 *   get:
 *     summary: Get all hubs with pagination
 *     tags: [Hubs]
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
 *         description: List of hubs
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
 *                     hubs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Hub'
 *                     total:
 *                       type: number
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/', HubController.getAllHubs as RequestHandler);

/**
 * @swagger
 * /hubs:
 *   post:
 *     summary: Create a new hub
 *     tags: [Hubs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hub'
 *     responses:
 *       201:
 *         description: Hub created successfully
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
 *                   $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Hub created successfully
 *       409:
 *         description: Hub with this ID already exists
 */
router.post('/', HubController.createHub as RequestHandler);

/**
 * @swagger
 * /hubs/{id}:
 *   get:
 *     summary: Get hub by ID
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hub ID
 *     responses:
 *       200:
 *         description: Hub details
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
 *                   $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       404:
 *         description: Hub not found
 */
router.get('/:id', HubController.getHubById as RequestHandler);

/**
 * @swagger
 * /hubs/{id}:
 *   patch:
 *     summary: Update hub
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hub ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hub'
 *     responses:
 *       200:
 *         description: Hub updated successfully
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
 *                   $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Hub updated successfully
 *       404:
 *         description: Hub not found
 *       409:
 *         description: Hub with this ID already exists
 */
router.patch('/:id', HubController.updateHub as RequestHandler);

/**
 * @swagger
 * /hubs/{id}:
 *   delete:
 *     summary: Delete hub
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hub ID
 *     responses:
 *       200:
 *         description: Hub deleted successfully
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
 *                   example: Hub deleted successfully
 *       404:
 *         description: Hub not found
 */
router.delete('/:id', HubController.deleteHub as RequestHandler);

/**
 * @swagger
 * /hubs/umbrella/{umbrella}:
 *   get:
 *     summary: Get hubs by umbrella
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: umbrella
 *         required: true
 *         schema:
 *           type: string
 *         description: Umbrella category
 *     responses:
 *       200:
 *         description: List of hubs for the umbrella
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
 *                     $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/umbrella/:umbrella', HubController.getHubsByUmbrella as RequestHandler);

/**
 * @swagger
 * /hubs/course/{course}:
 *   get:
 *     summary: Get hubs by course
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: course
 *         required: true
 *         schema:
 *           type: string
 *         description: Course name
 *     responses:
 *       200:
 *         description: List of hubs for the course
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
 *                     $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/course/:course', HubController.getHubsByCourse as RequestHandler);

/**
 * @swagger
 * /hubs/search/{query}:
 *   get:
 *     summary: Search hubs
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (name, course, or umbrella)
 *     responses:
 *       200:
 *         description: List of matching hubs
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
 *                     $ref: '#/components/schemas/Hub'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/search/:query', HubController.searchHubs as RequestHandler);

export default router; 