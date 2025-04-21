import { StudentEnroll, IStudentEnroll } from '../models/studentEnroll.model';

export class StudentEnrollService {
    static async createStudentEnroll(enrollData: Partial<IStudentEnroll>): Promise<IStudentEnroll> {
        try {
            const studentEnroll = new StudentEnroll(enrollData);
            return await studentEnroll.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error('Student enrollment with this ID or recordId already exists');
            }
            throw error;
        }
    }

    static async getStudentEnrollById(id: string): Promise<IStudentEnroll | null> {
        return await StudentEnroll.findOne({ ID: id });
    }

    static async getAllStudentEnrolls(page: number = 1, limit: number = 10): Promise<{ enrollments: IStudentEnroll[]; total: number }> {
        const skip = (page - 1) * limit;
        const [enrollments, total] = await Promise.all([
            StudentEnroll.find().skip(skip).limit(limit),
            StudentEnroll.countDocuments()
        ]);
        return { enrollments, total };
    }

    static async updateStudentEnroll(id: string, updateData: Partial<IStudentEnroll>): Promise<IStudentEnroll | null> {
        try {
            return await StudentEnroll.findOneAndUpdate(
                { ID: id },
                { $set: updateData },
                { new: true }
            );
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error('Student enrollment with this ID or recordId already exists');
            }
            throw error;
        }
    }

    static async deleteStudentEnroll(id: string): Promise<IStudentEnroll | null> {
        return await StudentEnroll.findOneAndDelete({ ID: id });
    }

    static async getEnrollmentsByStudent(studentId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_student: studentId });
    }

    static async getEnrollmentsBySection(sectionId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_section: sectionId });
    }

    static async getEnrollmentsByPartnerSchool(partnerSchoolId: string): Promise<IStudentEnroll[]> {
        return await StudentEnroll.find({ id_partnerSchool: partnerSchoolId });
    }

    static async updateEnrollmentStatus(id: string, status: string, reason?: string): Promise<IStudentEnroll | null> {
        const updateData: Partial<IStudentEnroll> = {
            status_roster: status,
            removeReason: reason || ''
        };
        return await StudentEnroll.findOneAndUpdate(
            { ID: id },
            { $set: updateData },
            { new: true }
        );
    }
} 