import { PartnerSchool, IPartnerSchool } from '../models/partnerSchool.model';

interface MongoError extends Error {
    code?: number;
}

/**
 * Service class for managing Partner School entities.
 * Provides CRUD operations and additional methods for managing partner schools in the system.
 */
export class PartnerSchoolService {
    /**
     * Creates a new partner school.
     * @param schoolData - The partner school data to create
     * @returns The created partner school document
     * @throws Error if a partner school with the same ID already exists
     * @throws Error if there's a database error
     */
    static async createPartnerSchool(schoolData: Partial<IPartnerSchool>): Promise<IPartnerSchool> {
        try {
            const school = new PartnerSchool(schoolData);
            return await school.save();
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                throw new Error('Partner school with this ID already exists');
            }
            throw error;
        }
    }

    /**
     * Retrieves a partner school by its ID.
     * @param id - The ID of the partner school to find
     * @returns The found partner school document, or null if not found
     * @throws Error if there's a database error
     */
    static async getPartnerSchoolById(id: string): Promise<IPartnerSchool | null> {
        return await PartnerSchool.findOne({ ID: id });
    }

    /**
     * Retrieves all partner schools with pagination.
     * @param page - The page number (default: 1)
     * @param limit - The number of items per page (default: 10)
     * @returns An object containing the schools array and total count
     * @throws Error if there's a database error
     */
    static async getAllPartnerSchools(page: number = 1, limit: number = 10): Promise<{ schools: IPartnerSchool[]; total: number }> {
        const skip = (page - 1) * limit;
        const [schools, total] = await Promise.all([
            PartnerSchool.find().sort({ CreationTimestamp: -1 }).skip(skip).limit(limit),
            PartnerSchool.countDocuments()
        ]);
        return { schools, total };
    }

    /**
     * Updates a partner school.
     * @param id - The ID of the partner school to update
     * @param updateData - The data to update
     * @returns The updated partner school document, or null if not found
     * @throws Error if a partner school with the same ID already exists
     * @throws Error if there's a database error
     */
    static async updatePartnerSchool(id: string, updateData: Partial<IPartnerSchool>): Promise<IPartnerSchool | null> {
        try {
            const school = await PartnerSchool.findOneAndUpdate(
                { ID: id },
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return school;
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                throw new Error('Partner school with this ID already exists');
            }
            throw error;
        }
    }

    /**
     * Deletes a partner school.
     * @param id - The ID of the partner school to delete
     * @returns The deleted partner school document, or null if not found
     * @throws Error if there's a database error
     */
    static async deletePartnerSchool(id: string): Promise<IPartnerSchool | null> {
        return await PartnerSchool.findOneAndDelete({ ID: id });
    }

    /**
     * Searches for partner schools based on a query string.
     * The search is performed on both school name and ID fields.
     * @param query - The search query string
     * @returns An array of matching partner school documents
     * @throws Error if there's a database error
     */
    static async searchPartnerSchools(query: string): Promise<IPartnerSchool[]> {
        return await PartnerSchool.find({
            $or: [
                { schoolName: { $regex: query, $options: 'i' } },
                { ID: { $regex: query, $options: 'i' } }
            ]
        }).sort({ schoolName: 1 });
    }

    /**
     * Retrieves partner schools filtered by email authentication user.
     * @param email - The email address of the authentication user
     * @returns An array of partner school documents associated with the email
     * @throws Error if there's a database error
     */
    static async getPartnerSchoolsByEmailAuth(email: string): Promise<IPartnerSchool[]> {
        return await PartnerSchool.find({ xx_email_auth_user: email }).sort({ schoolName: 1 });
    }
} 