import moment from 'moment-timezone';
import { Student, IStudent } from '../models/student.model';
import FileMakerService from './filemaker.service';
import { IStudentFilemaker, StudentFileMakerResponse } from '../types/filemaker.types';

interface MongoError extends Error {
    code?: number;
}

/**
 * Service class for managing Student entities.
 * Provides CRUD operations and additional methods for managing students in the system.
 */
export class StudentService {
    /**
     * Creates a new student.
     * @param studentData - The student data to create
     * @returns The created student document
     * @throws Error if a student with the same ID or CPSID already exists
     * @throws Error if there's a database error
     */
    static async createStudent(studentData: Partial<IStudent>): Promise<IStudent> {
        try {
            const student = new Student(studentData);
            return await student.save();
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                if (mongoError.message.includes('ID')) {
                    throw new Error('Student with this ID already exists');
                } else if (mongoError.message.includes('CPSID')) {
                    throw new Error('Student with this CPSID already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Retrieves a student by their ID or CPSID.
     * @param id - The ID or CPSID of the student to find
     * @returns The found student document, or null if not found
     * @throws Error if there's a database error
     */
    static async getStudentById(id: string): Promise<IStudent | null> {
        return await Student.findOne({
            $or: [
                { ID: id },
                { CPSID: id }
            ]
        });
    }

    /**
     * Retrieves all students with pagination.
     * @param page - The page number (default: 1)
     * @param limit - The number of items per page (default: 10)
     * @returns An object containing the students array and total count
     * @throws Error if there's a database error
     */
    static async getAllStudents(page: number = 1, limit: number = 10): Promise<{ students: IStudent[]; total: number }> {
        const skip = (page - 1) * limit;
        const [students, total] = await Promise.all([
            Student.find().sort({ CreationTimestamp: -1 }).skip(skip).limit(limit),
            Student.countDocuments()
        ]);
        return { students, total };
    }

    /**
     * Updates a student.
     * @param id - The ID or CPSID of the student to update
     * @param updateData - The data to update
     * @returns The updated student document, or null if not found
     * @throws Error if a student with the same ID or CPSID already exists
     * @throws Error if there's a database error
     */
    static async updateStudent(id: string, updateData: Partial<IStudent>): Promise<IStudent | null> {
        try {
            const student = await Student.findOneAndUpdate(
                {
                    $or: [
                        { ID: id },
                        { CPSID: id }
                    ]
                },
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return student;
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                if (mongoError.message.includes('ID')) {
                    throw new Error('Student with this ID already exists');
                } else if (mongoError.message.includes('CPSID')) {
                    throw new Error('Student with this CPSID already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Deletes a student.
     * @param id - The ID or CPSID of the student to delete
     * @returns The deleted student document, or null if not found
     * @throws Error if there's a database error
     */
    static async deleteStudent(id: string): Promise<IStudent | null> {
        return await Student.findOneAndDelete({
            $or: [
                { ID: id },
                { CPSID: id }
            ]
        });
    }

    /**
     * Searches for students based on a query string.
     * The search is performed on name fields and IDs.
     * @param query - The search query string
     * @returns An array of matching student documents
     * @throws Error if there's a database error
     */
    static async searchStudents(query: string): Promise<IStudent[]> {
        return await Student.find({
            $or: [
                { name_first: { $regex: query, $options: 'i' } },
                { name_last: { $regex: query, $options: 'i' } },
                { name_full: { $regex: query, $options: 'i' } },
                { ID: { $regex: query, $options: 'i' } },
                { CPSID: { $regex: query, $options: 'i' } }
            ]
        }).sort({ name_last: 1, name_first: 1 });
    }

    /**
     * Retrieves students by partner school ID.
     * @param partnerSchoolId - The ID of the partner school
     * @returns An array of student documents associated with the partner school
     * @throws Error if there's a database error
     */
    static async getStudentsByPartnerSchool(partnerSchoolId: string): Promise<IStudent[]> {
        return await Student.find({ id_parsch: partnerSchoolId })
            .sort({ name_last: 1, name_first: 1 });
    }

    /**
     * Updates a student's eligibility flags.
     * @param id - The ID or CPSID of the student to update
     * @param eligibilityData - The eligibility data to update
     * @returns The updated student document, or null if not found
     * @throws Error if there's a database error
     */
    static async updateEligibility(
        id: string,
        eligibilityData: {
            mg_alg_school_elig?: number;
            mg_geo_school_elig?: number;
            mg_span_school_elig?: string;
            mg_eng_school_elig?: string;
        }
    ): Promise<IStudent | null> {
        return await Student.findOneAndUpdate(
            {
                $or: [
                    { ID: id },
                    { CPSID: id }
                ]
            },
            { $set: eligibilityData },
            { new: true }
        );
    }

    /**
   * 
   * @param date 
   * @param purge 
   * @returns 
   */
  static async syncStudent(
    date: string | null = null,
    purge = false
  ): Promise<{ totalRecords: number }> {
    try {
      const layoutName = "intg_student";
      const query = [];
      if (date) {
        const formattedDate = moment(date, "MMDDYYYY").format("MM/DD/YYYY");
        query.push({ ModificationTimestamp: `≥${formattedDate}` });
      }
      const client = new FileMakerService();
      const responseCount: StudentFileMakerResponse = await client.find(layoutName, query, { limit: 1 });
      console.log("responseCount: ", responseCount);
      const totalRecords = responseCount?.dataInfo?.foundCount || 0;

      // Start background processing
      (async () => {
        try {
          const chunkSize = 2000;
          const allStudents: IStudentFilemaker[] = [];

          for (let offset = 1; offset <= totalRecords; offset += chunkSize) {
            const result: StudentFileMakerResponse = await client.find(layoutName, query, {
              offset,
              limit: chunkSize,
            });
            allStudents.push(...result?.data || []);
          }

          console.log("Total students to sync: ", allStudents.length);
          if (purge) {
            await Student.deleteMany({});
            console.log("Students collection purged");
          }
          const studentData = await Promise.all(
            allStudents.map(async (student: IStudentFilemaker) => {
              const studentDoc = new Student({
                ID: student.fieldData.ID,
                recordId: student.recordId,
                id_parsch: student.fieldData.id_parsch,
                name_first: student.fieldData.name_first,
                name_last: student.fieldData.name_last,
                score1: student.fieldData.score1,
                score2: student.fieldData.score2,
                GPA: student.fieldData.GPA,
                grade_current: student.fieldData.grade_current,
                flag_alg_complete: student.fieldData.flag_alg_complete,
                CPSID: student.fieldData.CPSID,
                name_full: student.fieldData.name_full,
                attendance: student.fieldData.attendance,
                GPA_waiver_flag: student.fieldData.GPA_waiver_flag,
                attendance_waiver_flag: student.fieldData.attendance_waiver_flag,
                act: student.fieldData.act,
                sat_math: student.fieldData.sat_math,
                sat_eng: student.fieldData.sat_eng,
                alex: student.fieldData.alex,
                rtw: student.fieldData.rtw,
                mg_alg_school_elig: student.fieldData.mg_alg_school_elig,
                mg_geo_school_elig: student.fieldData.mg_geo_school_elig,
                mg_span_school_elig: student.fieldData.mg_span_school_elig,
                mg_eng_school_elig: student.fieldData.mg_eng_school_elig,
                CreationTimestamp: student.fieldData.CreationTimestamp,
                CreatedBy: student.fieldData.CreatedBy,
                ModificationTimestamp: student.fieldData.ModificationTimestamp,
                ModifiedBy: student.fieldData.ModifiedBy,
                ModifiedByWeb: student.fieldData.ModifiedByWeb,
                flag_addWeb: student.fieldData.flag_addWeb
              });
              return await studentDoc.save();
            })
          );
          console.log("Student synced: ", studentData.length);
        } catch (error) {
          console.error("Background sync error:", error);
        }
      })();

      return { totalRecords };
    } catch (error) {
      console.error("Sync error:", error);
      throw error;
    }
  }
} 