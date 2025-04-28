import { Router } from 'express';
import { RequestHandler } from 'express';
import { SectionController } from '../controllers/section.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Section:
 *       type: object
 *       required:
 *         - ID
 *         - CreatedBy
 *         - ModifiedBy
 *         - hub
 *         - daysWeek
 *         - time_start
 *         - time_end
 *         - capacity_target
 *         - capacity_overPercent
 *         - capacity_max
 *         - enrolled_c
 *       properties:
 *         ID:
 *           type: string
 *           description: The custom ID of the section
 *         CreationTimestamp:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp
 *         CreatedBy:
 *           type: string
 *           description: Who created the section
 *         ModificationTimestamp:
 *           type: string
 *           format: date-time
 *           description: The last modification timestamp
 *         ModifiedBy:
 *           type: string
 *           description: Who last modified the section
 *         hub:
 *           type: string
 *           description: The hub ID this section belongs to
 *         daysWeek:
 *           type: string
 *           description: The days of the week (e.g., "M - F")
 *         time_start:
 *           type: string
 *           format: time
 *           description: The start time (HH:MM:SS)
 *         time_end:
 *           type: string
 *           format: time
 *           description: The end time (HH:MM:SS)
 *         capacity_target:
 *           type: number
 *           description: The target capacity
 *         capacity_overPercent:
 *           type: number
 *           description: The over capacity percentage
 *         capacity_max:
 *           type: number
 *           description: The maximum capacity
 *         enrolled_c:
 *           type: number
 *           description: Current enrollment count
 *         capacity_remaining_target_c:
 *           type: number
 *           description: Remaining target capacity
 *         capacity_remaining_max_c:
 *           type: number
 *           description: Remaining maximum capacity
 */

/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Get all sections with pagination
 *     tags: [Sections]
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
 *         description: List of sections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Section'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', SectionController.getAllSections as RequestHandler);

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Create a new section
 *     tags: [Sections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Section'
 *     responses:
 *       201:
 *         description: Section created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', SectionController.createSection as RequestHandler);

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     summary: Get a section by ID
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Section'
 *       404:
 *         description: Section not found
 */
router.get('/:id', SectionController.getSectionById as RequestHandler);

/**
 * @swagger
 * /sections/filemaker/{id}:
 *   get:
 *     summary: Get a section by Filemaker ID
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Filemaker Section ID
 *     responses:
 *       200:
 *         description: Section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Section'
 *       404:
 *         description: Section not found
 */
router.get('/filemaker/:id', SectionController.getSectionByFilemakerId as RequestHandler);

/**
 * @swagger
 * /sections/{id}:
 *   patch:
 *     summary: Update a section
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Section'
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       404:
 *         description: Section not found
 */
router.patch('/:id', SectionController.updateSection as RequestHandler);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Delete a section
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       404:
 *         description: Section not found
 */
router.delete('/:id', SectionController.deleteSection as RequestHandler);

/**
 * @swagger
 * /sections/hub/{hubId}:
 *   get:
 *     summary: Get all sections for a hub
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: hubId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hub ID
 *     responses:
 *       200:
 *         description: List of sections for the hub
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Section'
 */
router.get('/hub/:hubId', SectionController.getSectionsByHub as RequestHandler);

/**
 * @swagger
 * /sections/{id}/capacity:
 *   get:
 *     summary: Check section capacity
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section capacity information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFull:
 *                   type: boolean
 *                 isOverCapacity:
 *                   type: boolean
 *                 remainingTarget:
 *                   type: number
 *                 remainingMax:
 *                   type: number
 *                 currentEnrollment:
 *                   type: number
 *                 targetCapacity:
 *                   type: number
 *                 maxCapacity:
 *                   type: number
 */
router.get('/:id/capacity', SectionController.checkSectionCapacity as RequestHandler);

/**
 * @swagger
 * /sections/{id}/enrollment:
 *   patch:
 *     summary: Update section enrollment
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               change:
 *                 type: number
 *                 description: The change in enrollment (positive or negative)
 *     responses:
 *       200:
 *         description: Enrollment updated successfully
 *       400:
 *         description: Invalid enrollment change
 *       404:
 *         description: Section not found
 */
router.patch('/:id/enrollment', SectionController.updateEnrollment as RequestHandler);

export default router; 