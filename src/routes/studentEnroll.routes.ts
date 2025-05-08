import { Router, Request, Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { StudentEnrollController } from '../controllers/studentEnroll.controller';
import { ResponseUtil } from '../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentEnroll:
 *       type: object
 *       required:
 *         - ID
 *         - CreationTimestamp
 *         - CreatedBy
 *         - ModificationTimestamp
 *         - ModifiedBy
 *         - id_hub
 *         - id_partnerSchool
 *         - id_section
 *         - id_student
 *       properties:
 *         ID:
 *           type: string
 *           description: The unique identifier for the student enrollment
 *         CreationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was created
 *         CreatedBy:
 *           type: string
 *           description: User who created the record
 *         ModificationTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was last modified
 *         ModifiedBy:
 *           type: string
 *           description: User who last modified the record
 *         id_hub:
 *           type: string
 *           description: Reference to the hub
 *         id_partnerSchool:
 *           type: string
 *           description: Reference to the partner school
 *         id_section:
 *           type: string
 *           description: Reference to the section
 *         id_student:
 *           type: string
 *           description: Reference to the student
 *         status_roster:
 *           type: string
 *           description: Status of the roster
 *           default: "Not Enrolled"
 *         removeReason:
 *           type: string
 *           description: Reason for removal
 *           default: ""
 *         removeReason_other:
 *           type: string
 *           description: Other removal reason
 *           default: ""
 *         removeReason_additionalContext:
 *           type: string
 *           description: Additional context for removal
 *           default: ""
 *         flag_enrolled:
 *           type: number
 *           description: Enrollment flag
 *           default: 0
 *         flag_removeWeb:
 *           type: string
 *           description: Web removal flag
 *           default: ""
 *         flag_addWeb:
 *           type: string
 *           description: Web addition flag
 *           default: ""
 *         temp_firstName:
 *           type: string
 *           description: Temporary first name
 *           default: ""
 *         temp_lastName:
 *           type: string
 *           description: Temporary last name
 *           default: ""
 *         temp_CPSID:
 *           type: string
 *           description: Temporary CPS ID
 *           default: ""
 *         ModifiedByWeb:
 *           type: string
 *           description: Web user who modified the record
 *           default: ""
 *         id_sectionMoveWeb:
 *           type: string
 *           description: Section move web ID
 *           default: ""
 *         flag_moveWeb:
 *           type: string
 *           description: Web move flag
 *           default: ""
 *         recordId:
 *           type: string
 *           description: Record ID
 */

const router = Router();

/**
 * @swagger
 * /student-enrollments:
 *   get:
 *     summary: Get all student enrollments with pagination
 *     tags: [StudentEnrollments]
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
 *         description: List of student enrollments
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
 *                     enrollments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentEnroll'
 *                     total:
 *                       type: number
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/', StudentEnrollController.getAllEnrollments as RequestHandler);

/**
 * @swagger
 * /student-enrollments:
 *   post:
 *     summary: Create a new student enrollment
 *     tags: [StudentEnrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentEnroll'
 *     responses:
 *       201:
 *         description: Student enrollment created successfully
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
 *                   $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Student enrollment created successfully
 *       409:
 *         description: Student enrollment with this ID already exists
 */
router.post('/', StudentEnrollController.createEnrollment as RequestHandler);

/**
 * @swagger
 * /student-enrollments/{id}:
 *   get:
 *     summary: Get student enrollment by ID
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student enrollment ID
 *     responses:
 *       200:
 *         description: Student enrollment details
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
 *                   $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       404:
 *         description: Student enrollment not found
 */
router.get('/:id', StudentEnrollController.getEnrollmentById as RequestHandler);

/**
 * @swagger
 * /student-enrollments/{id}:
 *   patch:
 *     summary: Update student enrollment
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentEnroll'
 *     responses:
 *       200:
 *         description: Student enrollment updated successfully
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
 *                   $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Student enrollment updated successfully
 *       404:
 *         description: Student enrollment not found
 *       409:
 *         description: Student enrollment with this ID already exists
 */
router.patch('/:id', StudentEnrollController.updateEnrollment as RequestHandler);

/**
 * @swagger
 * /student-enrollments/{id}:
 *   delete:
 *     summary: Delete student enrollment
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student enrollment ID
 *     responses:
 *       200:
 *         description: Student enrollment deleted successfully
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
 *                 message:
 *                   type: string
 *                   example: Student enrollment deleted successfully
 *       404:
 *         description: Student enrollment not found
 */
router.delete('/:id', StudentEnrollController.deleteEnrollment as RequestHandler);

/**
 * @swagger
 * /student-enrollments/hub/{hubId}:
 *   get:
 *     summary: Get enrollments by hub ID
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: hubId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hub ID
 *     responses:
 *       200:
 *         description: List of enrollments for the hub
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
 *                     $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/hub/:hubId', StudentEnrollController.getEnrollmentsByHub as RequestHandler);

/**
 * @swagger
 * /student-enrollments/partner-school/{partnerSchoolId}:
 *   get:
 *     summary: Get enrollments by partner school ID
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: partnerSchoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     responses:
 *       200:
 *         description: List of enrollments for the partner school
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
 *                     $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/partner-school/:partnerSchoolId', StudentEnrollController.getEnrollmentsByPartnerSchool as RequestHandler);

/**
 * @swagger
 * /student-enrollments/section/{sectionId}:
 *   get:
 *     summary: Get enrollments by section ID with pagination and search
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter results
 *     responses:
 *       200:
 *         description: List of enrollments for the section
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
 *                     enrollments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentEnroll'
 *                     total:
 *                       type: number
 *                       description: Total number of enrollments
 *                     page:
 *                       type: number
 *                       description: Current page number
 *                     limit:
 *                       type: number
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: number
 *                       description: Total number of pages
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       500:
 *         description: Server error
 */
router.get('/section/:sectionId', StudentEnrollController.getEnrollmentsBySection as RequestHandler);

/**
 * @swagger
 * /student-enrollments/student/{studentId}:
 *   get:
 *     summary: Get enrollments by student ID
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of enrollments for the student
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
 *                     $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 */
router.get('/student/:studentId', StudentEnrollController.getEnrollmentsByStudent as RequestHandler);

/**
 * @swagger
 * /student-enrollments/search:
 *   get:
 *     summary: Search enrollments
 *     tags: [StudentEnrollments]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching enrollments
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
 *                     $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Operation successful
 *       400:
 *         description: Search query is required
 */
router.get('/search', StudentEnrollController.searchEnrollments as RequestHandler);

/**
 * @swagger
 * /student-enrollments/add-student:
 *   post:
 *     summary: Add a student with temporary information
 *     tags: [StudentEnrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_hub
 *               - id_partnerSchool
 *               - id_section
 *               - temp_firstName
 *               - temp_lastName
 *             properties:
 *               id_hub:
 *                 type: string
 *                 description: Hub ID
 *               id_partnerSchool:
 *                 type: string
 *                 description: Partner school ID
 *               id_section:
 *                 type: string
 *                 description: Section ID
 *               temp_firstName:
 *                 type: string
 *                 description: Student's first name
 *               temp_lastName:
 *                 type: string
 *                 description: Student's last name
 *               temp_CPSID:
 *                 type: string
 *                 description: Student's CPS ID (optional)
 *     responses:
 *       201:
 *         description: Student addition request submitted successfully
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
 *                   $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Student addition request submitted successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/add-student', StudentEnrollController.addStudent as RequestHandler);

/**
 * @swagger
 * /student-enrollments/remove-student:
 *   post:
 *     summary: Request to remove a student from enrollment
 *     tags: [StudentEnrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_hub
 *               - id_section
 *               - id_student
 *               - id_partnerSchool
 *               - removeReason
 *             properties:
 *               id_hub:
 *                 type: string
 *                 description: Hub ID
 *               id_section:
 *                 type: string
 *                 description: Section ID
 *               id_student:
 *                 type: string
 *                 description: Student ID
 *               id_partnerSchool:
 *                 type: string
 *                 description: Partner school ID
 *               removeReason:
 *                 type: string
 *                 description: Reason for removal
 *               removeOther:
 *                 type: string
 *                 description: Other removal reason if applicable
 *               removeText:
 *                 type: string
 *                 description: Additional context for removal
 *     responses:
 *       200:
 *         description: Student removal request submitted successfully
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
 *                   $ref: '#/components/schemas/StudentEnroll'
 *                 message:
 *                   type: string
 *                   example: Student removal request submitted successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Student enrollment not found
 *       500:
 *         description: Server error
 */
router.post('/remove-student', StudentEnrollController.removeStudent as RequestHandler);

export default router; 