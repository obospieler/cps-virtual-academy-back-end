import moment from 'moment-timezone';
import { Section, ISection } from '../models/section.model';
import { Types } from 'mongoose';
import FileMakerService from './filemaker.service';
import { ISectionFilemaker, SectionFileMakerResponse } from '../types/filemaker.types';

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
                isFull: (sectionDoc.enrolled_c ?? 0) >= (sectionDoc.capacity_max ?? 0),
                isOverCapacity: (sectionDoc.enrolled_c ?? 0) > (sectionDoc.capacity_target ?? 0),
                remainingTarget: sectionDoc.capacity_remaining_target_c ?? 0,
                remainingMax: sectionDoc.capacity_remaining_max_c ?? 0,
                currentEnrollment: sectionDoc.enrolled_c ?? 0,
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

            const newEnrollment = (section.enrolled_c ?? 0) + change;
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


/**
 * 
 * @param date 
 * @param purge 
 * @returns 
 */
    static async syncSections(
        date: string | null = null,
        purge = false
      ): Promise<{ totalRecords: number }> {
        try {
          const layoutName = "intg_section";
          const query = [];
          if (date) {
            const formattedDate = moment(date, "MMDDYYYY").format("MM/DD/YYYY");
            query.push({ ModificationTimestamp: `≥${formattedDate}` });
          }
          const client = new FileMakerService();
          const responseCount: SectionFileMakerResponse = await client.find(layoutName, query, { limit: 1 });
          console.log("responseCount: ", responseCount);
          const totalRecords = responseCount?.dataInfo?.foundCount || 0;
    
          // Start background processing
          (async () => {
            try {
              const chunkSize = 2000;
              const allSections: ISectionFilemaker[] = [];
    
              for (let offset = 1; offset <= totalRecords; offset += chunkSize) {
                const result: SectionFileMakerResponse = await client.find(layoutName, query, {
                  offset,
                  limit: chunkSize,
                });
                allSections.push(...result?.data || []);
              }
    
              console.log("Total sections to sync: ", allSections.length);
              if (purge) {
                await Section.deleteMany({});
                console.log("Sections collection purged");
              }
              const sectionData = await Promise.all(
                allSections.map(async (section: ISectionFilemaker) => {
                  const sectiionDoc = new Section({
                    ID: section.fieldData.ID,
                    CreationTimestamp: section.fieldData.CreationTimestamp,
                    CreatedBy: section.fieldData.CreatedBy,
                    ModificationTimestamp: section.fieldData.ModificationTimestamp,
                    ModifiedBy: section.fieldData.ModifiedBy,
                    id_hub: section.fieldData.id_hub,
                    daysWeek: section.fieldData.daysWeek,
                    time_start: section.fieldData.time_start,
                    time_end: section.fieldData.time_end,
                    capacity_target: section.fieldData.capacity_target,
                    capacity_overPercent: section.fieldData.capacity_overPercent,
                    capacity_max: section.fieldData.capacity_max,
                    enrolled_c: section.fieldData.enrolled_c,
                    capacity_remaining_target_c: section.fieldData.capacity_remaining_target_c,
                    capacity_remaining_max_c: section.fieldData.capacity_remaining_max_c,
                    ModifiedByWeb: section.fieldData.ModifiedByWeb,
                    recordId: section.recordId
                  });
                  return await sectiionDoc.save();
                })
              );
              console.log("Sections synced: ", sectionData.length);
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