import { Section, ISection } from '../models/section.model';
import { Types } from 'mongoose';

interface MongoError extends Error {
    code?: number;
}

export class SectionService {
    /**
     * Create a new section
     * @param sectionData The section data to create
     * @returns The created section
     */
    static async createSection(sectionData: Omit<ISection, '_id' | 'CreationTimestamp' | 'ModificationTimestamp'>): Promise<ISection> {
        try {
            const section = new Section(sectionData);
            return await section.save();
        } catch (error) {
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                throw new Error('Section with this ID already exists');
            }
            throw new Error(`Error creating section: ${mongoError.message}`);
        }
    }

    /**
     * Get all sections
     * @param page Page number for pagination
     * @param limit Number of items per page
     * @returns Array of sections and pagination info
     */
    static async getAllSections(page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
            const sections = await Section.find()
                .populate('hub')
                .skip(skip)
                .limit(limit)
                .sort({ CreationTimestamp: -1 });

            const total = await Section.countDocuments();

            return {
                sections,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error fetching sections: ${err.message}`);
        }
    }

    /**
     * Get a section by ID
     * @param id The section ID (MongoDB _id)
     * @returns The section if found
     */
    static async getSectionById(id: string): Promise<ISection | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid section ID');
            }
            return await Section.findById(id).populate('hub');
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error fetching section: ${err.message}`);
        }
    }

    /**
     * Get a section by custom ID
     * @param filemakerId The custom section ID
     * @returns The section if found
     */
    static async getSectionByFilemakerId(filemakerId: string): Promise<ISection | null> {
        try {
            return await Section.findOne({ ID: filemakerId }).populate('hub');
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error fetching section: ${err.message}`);
        }
    }

    /**
     * Update a section
     * @param id The section ID (MongoDB _id)
     * @param updateData The data to update
     * @returns The updated section
     */
    static async updateSection(id: string, updateData: Partial<ISection>): Promise<ISection | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid section ID');
            }

            // Remove fields that shouldn't be updated
            const { _id, ID, CreationTimestamp, ...cleanUpdateData } = updateData;

            // Update and return populated document in one go
            const section = await Section.findByIdAndUpdate(
                id,
                { $set: cleanUpdateData },
                { new: true, runValidators: true }
            ).populate('hub');

            if (!section) {
                throw new Error('Section not found');
            }

            return section;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error updating section: ${err.message}`);
        }
    }

    /**
     * Delete a section
     * @param id The section ID (MongoDB _id)
     * @returns The deleted section
     */
    static async deleteSection(id: string): Promise<ISection | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid section ID');
            }

            // Get populated document before deletion
            const section = await Section.findById(id).populate('hub');
            if (!section) {
                throw new Error('Section not found');
            }
            
            await Section.findByIdAndDelete(id);
            return section;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error deleting section: ${err.message}`);
        }
    }

    /**
     * Get sections by hub ID
     * @param hubId The hub ID
     * @returns Array of sections for the given hub
     */
    static async getSectionsByHub(hubId: string): Promise<ISection[]> {
        try {
            return await Section.find({ id_hub: hubId })
                .populate('hub')
                .sort({ time_start: 1 });
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error fetching sections by hub: ${err.message}`);
        }
    }

    /**
     * Check if a section has available capacity
     * @param id The section ID (MongoDB _id)
     * @returns Object with capacity information
     */
    static async checkSectionCapacity(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid section ID');
            }

            const section = await Section.findById(id).populate('hub');
            if (!section) {
                throw new Error('Section not found');
            }

            const sectionDoc = section.toObject();
            return {
                isFull: sectionDoc.enrolled_c >= sectionDoc.capacity_max,
                isOverCapacity: sectionDoc.enrolled_c > sectionDoc.capacity_target,
                remainingTarget: sectionDoc.capacity_remaining_target_c,
                remainingMax: sectionDoc.capacity_remaining_max_c,
                currentEnrollment: sectionDoc.enrolled_c,
                targetCapacity: sectionDoc.capacity_target,
                maxCapacity: sectionDoc.capacity_max,
                hub: sectionDoc.hub
            };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error checking section capacity: ${err.message}`);
        }
    }

    /**
     * Update section enrollment
     * @param id The section ID (MongoDB _id)
     * @param change The change in enrollment (positive or negative)
     * @returns The updated section
     */
    static async updateEnrollment(id: string, change: number): Promise<ISection | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid section ID');
            }

            const section = await Section.findById(id);
            if (!section) {
                throw new Error('Section not found');
            }

            const newEnrollment = section.enrolled_c + change;
            if (newEnrollment < 0) {
                throw new Error('Enrollment cannot be negative');
            }

            if (newEnrollment > section.capacity_max) {
                throw new Error('Section is at maximum capacity');
            }

            section.enrolled_c = newEnrollment;
            section.capacity_remaining_target_c = section.capacity_target - newEnrollment;
            section.capacity_remaining_max_c = section.capacity_max - newEnrollment;

            await section.save();
            
            // Return populated document after save
            return await Section.findById(id).populate('hub');
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error updating enrollment: ${err.message}`);
        }
    }
}