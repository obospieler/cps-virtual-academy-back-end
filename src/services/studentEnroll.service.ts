import moment from 'moment-timezone';
import { StudentEnroll, IStudentEnroll } from '../models/studentEnroll.model';
import { ResponseUtil } from '../utils/response.util';
import FileMakerService from './filemaker.service';
import { IStudentEnrolledFilemaker, StudentEnrolledFileMakerResponse } from '../types/filemaker.types';
import { IHub } from '../models/hub.model';
import { IPartnerSchool } from '../models/partnerSchool.model';
import { ISection } from '../models/section.model';
import { SectionService } from './section.service';

interface MongoError extends Error {
    code?: number;
}

export class StudentEnrollService {
    /**
     * Create a new student enrollment
     * @param enrollmentData The enrollment data to create
     * @returns The created enrollment
     * @throws Error if enrollment with the same ID already exists
     */
    static async createEnrollment(enrollmentData: Partial<IStudentEnroll>): Promise<IStudentEnroll> {
        try {
            const enrollment = new StudentEnroll(enrollmentData);
            return await enrollment.save();
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                throw new Error('Student enrollment with this ID already exists');
            }
            throw error;
        }
    }

    /**
     * Get an enrollment by its ID
     * @param id The enrollment ID
     * @returns The enrollment if found, null otherwise
     */
    static async getEnrollmentById(id: string): Promise<IStudentEnroll | null> {
        return await StudentEnroll.findOne({ ID: id })
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student');
    }

    /**
     * Get all enrollments with pagination
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 10)
     * @returns Object containing enrollments array and total count
     */
    static async getAllEnrollments(page: number = 1, limit: number = 10): Promise<{ enrollments: IStudentEnroll[]; total: number }> {
        const skip = (page - 1) * limit;
        const [enrollments, total] = await Promise.all([
            StudentEnroll.find()
                .sort({ CreationTimestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('hub')
                .populate('partnerSchool')
                .populate('section')
                .populate('student'),
            StudentEnroll.countDocuments()
        ]);
        return { enrollments, total };
    }

    /**
     * Update an enrollment by its ID
     * @param id The enrollment ID to update
     * @param updateData The data to update
     * @returns The updated enrollment if found, null otherwise
     * @throws Error if enrollment with the same ID already exists
     */
    static async updateEnrollment(id: string, updateData: Partial<IStudentEnroll>): Promise<IStudentEnroll | null> {
        try {
            const enrollment = await StudentEnroll.findOneAndUpdate(
                { ID: id },
                { $set: updateData },
                { new: true, runValidators: true }
            )
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student');
            return enrollment;
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                throw new Error('Student enrollment with this ID already exists');
            }
            throw error;
        }
    }

    /**
     * Delete an enrollment by its ID
     * @param id The enrollment ID to delete
     * @returns The deleted enrollment if found, null otherwise
     */
    static async deleteEnrollment(id: string): Promise<IStudentEnroll | null> {
        return await StudentEnroll.findOneAndDelete({ ID: id });
    }

    /**
     * Get enrollments by hub ID
     * @param hubId The hub ID to filter by
     * @returns Array of enrollments matching the hub ID
     */
    static async getEnrollmentsByHub(hubId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_hub: hubId })
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Get enrollments by partner school ID
     * @param partnerSchoolId The partner school ID to filter by
     * @returns Array of enrollments matching the partner school ID
     */
    static async getEnrollmentsByPartnerSchool(partnerSchoolId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_partnerSchool: partnerSchoolId })
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Get enrollments by section ID
     * @param sectionId The section ID to filter by
     * @returns Array of enrollments matching the section ID
     */
    static async getEnrollmentsBySection(sectionId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_section: sectionId })
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Get enrollments by student ID
     * @param studentId The student ID to filter by
     * @returns Array of enrollments matching the student ID
     */
    static async getEnrollmentsByStudent(studentId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_student: studentId })
            .populate('hub')
            .populate('partnerSchool')
            .populate('section')
            .populate('student')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Search enrollments by various criteria
     * @param query The search query string
     * @returns Array of enrollments matching the search criteria
     */
    static async searchEnrollments(query: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({
            $or: [
                { status_roster: { $regex: query, $options: 'i' } },
                { removeReason: { $regex: query, $options: 'i' } },
                { temp_firstName: { $regex: query, $options: 'i' } },
                { temp_lastName: { $regex: query, $options: 'i' } },
                { temp_CPSID: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('hub')
        .populate('partnerSchool')
        .populate('section')
        .populate('student')
        .sort({ CreationTimestamp: -1 });
    }

    /**
   * 
   * @param date 
   * @param purge 
   * @returns 
   */
  static async syncStudentEnrolled(
    date: string | null = null,
    purge = false
  ): Promise<{ totalRecords: number }> {
    try {
      const layoutName = "intg_studentEnroll";
      const query = [];
      if (date) {
        const formattedDate = moment(date, "MMDDYYYY").format("MM/DD/YYYY");
        query.push({ ModificationTimestamp: `≥${formattedDate}` });
      }
      const client = new FileMakerService();
      const responseCount: StudentEnrolledFileMakerResponse = await client.find(layoutName, query, { limit: 1 });
      console.log("responseCount: ", responseCount?.data?.[0].fieldData);
      const totalRecords = responseCount?.dataInfo?.foundCount || 0;

      // Start background processing
      (async () => {
        try {
          const chunkSize = 2000;
          const allStudentEnrolled: IStudentEnrolledFilemaker[] = [];

          for (let offset = 1; offset <= totalRecords; offset += chunkSize) {
            const result: StudentEnrolledFileMakerResponse = await client.find(layoutName, query, {
              offset,
              limit: chunkSize,
            });
            allStudentEnrolled.push(...result?.data || []);
          }

          console.log("Total studentEnrolled to sync: ", allStudentEnrolled.length);
          if (purge) {
            await StudentEnroll.deleteMany({});
            console.log("studentEnrolled collection purged");
          }
          const studentEnrolledData = await Promise.all(
            allStudentEnrolled.map(async (studentEnrolled: IStudentEnrolledFilemaker) => {

              const studentEnrollledDoc = new StudentEnroll({
                ID: studentEnrolled.fieldData.ID,
                CreationTimestamp: studentEnrolled.fieldData.CreationTimestamp,
                CreatedBy: studentEnrolled.fieldData.CreatedBy,
                ModificationTimestamp: studentEnrolled.fieldData.ModificationTimestamp,
                ModifiedBy: studentEnrolled.fieldData.ModifiedBy,
                id_hub: studentEnrolled.fieldData.id_hub,
                id_section: studentEnrolled.fieldData.id_section,
                id_partnerSchool: studentEnrolled.fieldData.id_partnerSchool,
                id_student: studentEnrolled.fieldData.ID,
                status_roster: 'Enrolled',
                removeReason: '',
                removeReason_other: '',
                removeReason_additionalContext: '',
                flag_enrolled: 1,
                flag_removeWeb: studentEnrolled.fieldData.flag_removeWeb,
                flag_addWeb: studentEnrolled.fieldData.flag_addWeb,
                temp_firstName: studentEnrolled.fieldData.temp_firstName || '',
                temp_lastName: studentEnrolled.fieldData.temp_lastName || '',
                temp_CPSID: studentEnrolled.fieldData.temp_CPSID || '',
                ModifiedByWeb: studentEnrolled.fieldData.ModifiedByWeb,
                id_sectionMoveWeb: '',
                flag_moveWeb: '',
                recordId: studentEnrolled.recordId
              });
              return await studentEnrollledDoc.save();
            })
          );
          console.log("studentEnrolled synced: ", studentEnrolledData.length);
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