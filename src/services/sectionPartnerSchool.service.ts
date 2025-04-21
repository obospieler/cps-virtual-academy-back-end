import { SectionPartnerSchool, ISectionPartnerSchool } from '../models/sectionPartnerSchool.model';
import { Types } from 'mongoose';

interface MongoError extends Error {
    code?: number;
}

/**
 * Service class for managing Section-PartnerSchool relationships.
 * Provides CRUD operations and additional methods for managing the relationships between sections and partner schools.
 */
export class SectionPartnerSchoolService {
    /**
     * Creates a new section-partner school relationship.
     * @param data - The relationship data to create
     * @returns The created relationship document
     * @throws Error if a relationship with the same ID or recordId already exists
     * @throws Error if there's a database error
     */
    static async createSectionPartnerSchool(data: Partial<ISectionPartnerSchool>): Promise<ISectionPartnerSchool> {
        try {
            const sectionPartnerSchool = new SectionPartnerSchool(data);
            return await sectionPartnerSchool.save();
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                if (mongoError.message.includes('ID')) {
                    throw new Error('Section partner school relationship with this ID already exists');
                } else if (mongoError.message.includes('recordId')) {
                    throw new Error('Section partner school relationship with this recordId already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Retrieves a section-partner school relationship by its ID or recordId.
     * @param id - The ID or recordId of the relationship to find
     * @returns The found relationship document, or null if not found
     * @throws Error if there's a database error
     */
    static async getSectionPartnerSchoolById(id: string): Promise<ISectionPartnerSchool | null> {
        return await SectionPartnerSchool.findOne({
            $or: [
                { ID: id },
                { recordId: id }
            ]
        })
            .populate('section')
            .populate('partnerSchool');
    }

    /**
     * Retrieves all section-partner school relationships with pagination.
     * @param page - The page number (default: 1)
     * @param limit - The number of items per page (default: 10)
     * @returns An object containing the relationships array and total count
     * @throws Error if there's a database error
     */
    static async getAllSectionPartnerSchools(page: number = 1, limit: number = 10): Promise<{ relationships: ISectionPartnerSchool[]; total: number }> {
        const skip = (page - 1) * limit;
        const [relationships, total] = await Promise.all([
            SectionPartnerSchool.find()
                .sort({ CreationTimestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('section')
                .populate('partnerSchool'),
            SectionPartnerSchool.countDocuments()
        ]);
        return { relationships, total };
    }

    /**
     * Updates a section-partner school relationship.
     * @param id - The ID or recordId of the relationship to update
     * @param updateData - The data to update
     * @returns The updated relationship document, or null if not found
     * @throws Error if a relationship with the same ID or recordId already exists
     * @throws Error if there's a database error
     */
    static async updateSectionPartnerSchool(id: string, updateData: Partial<ISectionPartnerSchool>): Promise<ISectionPartnerSchool | null> {
        try {
            const relationship = await SectionPartnerSchool.findOneAndUpdate(
                {
                    $or: [
                        { ID: id },
                        { recordId: id }
                    ]
                },
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('section')
             .populate('partnerSchool');
            return relationship;
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                if (mongoError.message.includes('ID')) {
                    throw new Error('Section partner school relationship with this ID already exists');
                } else if (mongoError.message.includes('recordId')) {
                    throw new Error('Section partner school relationship with this recordId already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Deletes a section-partner school relationship.
     * @param id - The ID or recordId of the relationship to delete
     * @returns The deleted relationship document, or null if not found
     * @throws Error if there's a database error
     */
    static async deleteSectionPartnerSchool(id: string): Promise<ISectionPartnerSchool | null> {
        return await SectionPartnerSchool.findOneAndDelete({
            $or: [
                { ID: id },
                { recordId: id }
            ]
        });
    }

    /**
     * Retrieves all relationships for a specific section.
     * @param sectionId - The ID of the section
     * @returns An array of relationship documents
     * @throws Error if there's a database error
     */
    static async getRelationshipsBySection(sectionId: string): Promise<ISectionPartnerSchool[]> {
        return await SectionPartnerSchool.find({ id_section: sectionId })
            .populate('section')
            .populate('partnerSchool')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Retrieves all relationships for a specific partner school.
     * @param partnerSchoolId - The ID of the partner school
     * @returns An array of relationship documents
     * @throws Error if there's a database error
     */
    static async getRelationshipsByPartnerSchool(partnerSchoolId: string): Promise<ISectionPartnerSchool[]> {
        return await SectionPartnerSchool.find({ id_partnerSchool: partnerSchoolId })
            .populate('section')
            .populate('partnerSchool')
            .sort({ CreationTimestamp: -1 });
    }

    /**
     * Updates the enrollment numbers for a relationship.
     * @param id - The ID or recordId of the relationship to update
     * @param numEnrolled - The new number of enrolled students
     * @param numRoster - The new roster count
     * @returns The updated relationship document, or null if not found
     * @throws Error if there's a database error
     */
    static async updateEnrollment(id: string, numEnrolled: number, numRoster: number): Promise<ISectionPartnerSchool | null> {
        return await SectionPartnerSchool.findOneAndUpdate(
            {
                $or: [
                    { ID: id },
                    { recordId: id }
                ]
            },
            { 
                $set: { 
                    numEnrolled_c: numEnrolled,
                    num_roster_c: numRoster,
                    ModificationTimestamp: new Date().toLocaleString()
                }
            },
            { new: true }
        ).populate('section')
         .populate('partnerSchool');
    }
} 