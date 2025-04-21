import { Router } from 'express';
import { RequestHandler } from 'express';
import { StudentController } from '../controllers/student.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - ID
 *         - name_first
 *         - name_last
 *         - CPSID
 *         - name_full
 *         - CreationTimestamp
 *         - CreatedBy
 *         - ModificationTimestamp
 *         - ModifiedBy
 *       properties:
 *         ID:
 *           type: string
 *           description: Unique identifier for the student
 *           example: "246023AD-891D-CA49-978C-0C796734EDCC"
 *         id_parsch:
 *           type: string
 *           description: Partner school ID
 *           example: ""
 *         name_first:
 *           type: string
 *           description: Student's first name
 *           example: "Tommy"
 *         name_last:
 *           type: string
 *           description: Student's last name
 *           example: "Test"
 *         CPSID:
 *           type: string
 *           description: CPS student ID
 *           example: "1234567890"
 *         name_full:
 *           type: string
 *           description: Student's full name
 *           example: "Tommy Test"
 *         CreationTimestamp:
 *           type: string
 *           description: Creation timestamp
 *           example: "01/24/2025 18:11:35"
 *         CreatedBy:
 *           type: string
 *           description: User who created the record
 *           example: "Admin"
 *         ModificationTimestamp:
 *           type: string
 *           description: Last modification timestamp
 *           example: "02/05/2025 12:41:28"
 *         ModifiedBy:
 *           type: string
 *           description: User who last modified the record
 *           example: "kristen"
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students with pagination
 *     tags: [Students]
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
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     total:
 *                       type: integer
 *                       example: 100
 *       500:
 *         description: Server error
 */
router.get('/', StudentController.getAllStudents as RequestHandler);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       409:
 *         description: Student with this ID or CPSID already exists
 *       500:
 *         description: Server error
 */
router.post('/', StudentController.createStudent as RequestHandler);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID or CPSID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID or CPSID
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/:id', StudentController.getStudentById as RequestHandler);

/**
 * @swagger
 * /students/{id}:
 *   patch:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID or CPSID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       409:
 *         description: Student with this ID or CPSID already exists
 *       500:
 *         description: Server error
 */
router.patch('/:id', StudentController.updateStudent as RequestHandler);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID or CPSID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', StudentController.deleteStudent as RequestHandler);

/**
 * @swagger
 * /students/search/{query}:
 *   get:
 *     summary: Search for students
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server error
 */
router.get('/search/:query', StudentController.searchStudents as RequestHandler);

/**
 * @swagger
 * /students/partner-school/{partnerSchoolId}:
 *   get:
 *     summary: Get students by partner school
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: partnerSchoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner school ID
 *     responses:
 *       200:
 *         description: List of students for the partner school
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server error
 */
router.get('/partner-school/:partnerSchoolId', StudentController.getStudentsByPartnerSchool as RequestHandler);

/**
 * @swagger
 * /students/{id}/eligibility:
 *   patch:
 *     summary: Update student eligibility flags
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID or CPSID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mg_alg_school_elig:
 *                 type: number
 *                 description: Algebra eligibility flag
 *               mg_geo_school_elig:
 *                 type: number
 *                 description: Geometry eligibility flag
 *               mg_span_school_elig:
 *                 type: string
 *                 description: Spanish eligibility flag
 *               mg_eng_school_elig:
 *                 type: string
 *                 description: English eligibility flag
 *     responses:
 *       200:
 *         description: Eligibility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/eligibility', StudentController.updateEligibility as RequestHandler);

export default router; 