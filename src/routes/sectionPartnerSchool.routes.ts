import { Router } from 'express';
import { RequestHandler } from 'express';
import { SectionPartnerSchoolController } from '../controllers/sectionPartnerSchool.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SectionPartnerSchool:
 *       type: object
 *       required:
 *         - ID
 *         - recordId
 *         - CreationTimestamp
 *         - CreatedBy
 *         - ModificationTimestamp
 *         - ModifiedBy
 *         - id_section
 *         - id_partnerSchool
 *       properties:
 *         ID:
 *           type: string
 *           description: Unique identifier for the relationship
 *           example: "SP001"
 *         recordId:
 *           type: string
 *           description: Alternative unique identifier for the relationship
 *           example: "SP001-REC"
 *         CreationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the relationship was created
 *           example: "2024-03-20T10:00:00Z"
 *         CreatedBy:
 *           type: string
 *           description: User who created the relationship
 *           example: "admin"
 *         ModificationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the relationship was last modified
 *           example: "2024-03-20T11:00:00Z"
 *         ModifiedBy:
 *           type: string
 *           description: User who last modified the relationship
 *           example: "admin"
 *         id_section:
 *           type: string
 *           description: Reference to the Section model
 *           example: "SEC001"
 *         id_partnerSchool:
 *           type: string
 *           description: Reference to the PartnerSchool model
 *           example: "PS001"
 *         numEnrolled_c:
 *           type: number
 *           description: Number of enrolled students
 *           example: 25
 *         num_roster_c:
 *           type: number
 *           description: Roster count
 *           example: 30
 *         flag_removeWeb:
 *           type: boolean
 *           description: Flag indicating if the relationship should be removed from web
 *           example: false
 *         flag_addWeb:
 *           type: boolean
 *           description: Flag indicating if the relationship should be added to web
 *           example: true
 *         ModifiedByWeb:
 *           type: string
 *           description: User who last modified the relationship through web interface
 *           example: "webadmin"
 */

/**
 * @swagger
 * /section-partner-schools:
 *   get:
 *     summary: Get all section partner school relationships
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of section partner school relationships
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
 *                     relationships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SectionPartnerSchool'
 *                     total:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       500:
 *         description: Server error
 */
router.get('/', SectionPartnerSchoolController.getAllSectionPartnerSchools as RequestHandler);

/**
 * @swagger
 * /section-partner-schools:
 *   post:
 *     summary: Create a new section partner school relationship
 *     tags: [SectionPartnerSchool]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionPartnerSchool'
 *     responses:
 *       201:
 *         description: Section partner school relationship created successfully
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
 *                   $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Relationship created successfully
 *       409:
 *         description: Conflict - Relationship with the same ID or recordId already exists
 *       500:
 *         description: Server error
 */
router.post('/', SectionPartnerSchoolController.createSectionPartnerSchool as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/{id}:
 *   get:
 *     summary: Get a section partner school relationship by ID or recordId
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section partner school ID or recordId
 *     responses:
 *       200:
 *         description: Section partner school relationship details
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
 *                   $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       404:
 *         description: Relationship not found
 *       500:
 *         description: Server error
 */
router.get('/:id', SectionPartnerSchoolController.getSectionPartnerSchoolById as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/{id}:
 *   patch:
 *     summary: Update a section partner school relationship
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section partner school ID or recordId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionPartnerSchool'
 *     responses:
 *       200:
 *         description: Section partner school relationship updated successfully
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
 *                   $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Relationship updated successfully
 *       404:
 *         description: Relationship not found
 *       409:
 *         description: Conflict - Relationship with the same ID or recordId already exists
 *       500:
 *         description: Server error
 */
router.patch('/:id', SectionPartnerSchoolController.updateSectionPartnerSchool as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/{id}:
 *   delete:
 *     summary: Delete a section partner school relationship
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section partner school ID or recordId
 *     responses:
 *       200:
 *         description: Section partner school relationship deleted successfully
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
 *                   $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Relationship deleted successfully
 *       404:
 *         description: Relationship not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', SectionPartnerSchoolController.deleteSectionPartnerSchool as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/section/{sectionId}:
 *   get:
 *     summary: Get all relationships for a specific section
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     responses:
 *       200:
 *         description: List of relationships for the section
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
 *                     $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       500:
 *         description: Server error
 */
router.get('/section/:sectionId', SectionPartnerSchoolController.getRelationshipsBySection as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/partner-school/{partnerSchoolId}:
 *   get:
 *     summary: Get all relationships for a specific partner school
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: partnerSchoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     responses:
 *       200:
 *         description: List of relationships for the partner school
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
 *                     $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       500:
 *         description: Server error
 */
router.get('/partner-school/:partnerSchoolId', SectionPartnerSchoolController.getRelationshipsByPartnerSchool as RequestHandler);

/**
 * @swagger
 * /section-partner-schools/{id}/enrollment:
 *   patch:
 *     summary: Update enrollment numbers for a relationship
 *     tags: [SectionPartnerSchool]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section partner school ID or recordId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numEnrolled
 *               - numRoster
 *             properties:
 *               numEnrolled:
 *                 type: number
 *                 description: New number of enrolled students
 *                 example: 25
 *               numRoster:
 *                 type: number
 *                 description: New roster count
 *                 example: 30
 *     responses:
 *       200:
 *         description: Enrollment numbers updated successfully
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
 *                   $ref: '#/components/schemas/SectionPartnerSchool'
 *                 message:
 *                   type: string
 *                   example: Enrollment updated successfully
 *       404:
 *         description: Relationship not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/enrollment', SectionPartnerSchoolController.updateEnrollment as RequestHandler);

export default router; 