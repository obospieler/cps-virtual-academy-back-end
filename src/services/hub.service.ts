import { Hub, IHub } from "../models/hub.model";
import { HubFileMakerResponse, IHubFileMaker } from "../types/filemaker.types";
import FileMakerService from "./filemaker.service";
import moment from "moment-timezone";

interface MongoError extends Error {
  code?: number;
}

export class HubService {
  /**
   * Create a new hub
   * @param hubData The hub data to create
   * @returns The created hub
   * @throws Error if hub with the same ID already exists
   */
  static async createHub(hubData: Partial<IHub>): Promise<IHub> {
    try {
      const hub = new Hub(hubData);
      return await hub.save();
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new Error("Hub with this ID already exists");
      }
      throw error;
    }
  }

  /**
   * Get a hub by its ID
   * @param id The hub _id
   * @returns The hub if found, null otherwise
   */
  static async getHubById(id: string): Promise<IHub | null> {
    return await Hub.findOne({ _id: id });
  }

  /**
   * Get all hubs with pagination
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 10)
   * @returns Object containing hubs array and total count
   */
  static async getAllHubs(
    page: number = 1,
    limit: number = 10
  ): Promise<{ hubs: IHub[]; total: number }> {
    const skip = (page - 1) * limit;
    const [hubs, total] = await Promise.all([
      Hub.find().sort({ CreationTimestamp: -1 }).skip(skip).limit(limit),
      Hub.countDocuments(),
    ]);
    return { hubs, total };
  }

  /**
   * Update a hub by its ID
   * @param id The hub ID to update
   * @param updateData The data to update
   * @returns The updated hub if found, null otherwise
   * @throws Error if hub with the same ID already exists
   */
  static async updateHub(
    id: string,
    updateData: Partial<IHub>
  ): Promise<IHub | null> {
    try {
      const hub = await Hub.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return hub;
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new Error("Hub with this ID already exists");
      }
      throw error;
    }
  }

  /**
   * Delete a hub by its ID
   * @param id The hub ID to delete
   * @returns The deleted hub if found, null otherwise
   */
  static async deleteHub(id: string): Promise<IHub | null> {
    return await Hub.findOneAndDelete({ _id: id });
  }

  /**
   * Get all hubs by umbrella category
   * @param umbrella The umbrella category to filter by
   * @returns Array of hubs matching the umbrella category
   */
  static async getHubsByUmbrella(umbrella: string): Promise<IHub[]> {
    return await Hub.find({ umbrella }).sort({ name: 1 });
  }

  /**
   * Get all hubs by course
   * @param course The course name to filter by
   * @returns Array of hubs matching the course
   */
  static async getHubsByCourse(course: string): Promise<IHub[]> {
    return await Hub.find({ course }).sort({ name: 1 });
  }

  /**
   * Search hubs by name, course, or umbrella
   * @param query The search query string
   * @returns Array of hubs matching the search criteria
   */
  static async searchHubs(query: string): Promise<IHub[]> {
    return await Hub.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { course: { $regex: query, $options: "i" } },
        { umbrella: { $regex: query, $options: "i" } },
      ],
    }).sort({ name: 1 });
  }

  static async syncHubs(
    date: string | null = null,
    purge = false
  ): Promise<{ totalRecords: number }> {
    try {
      const layoutName = "intg_hub";
      const query = [];
      if (date) {
        const formattedDate = moment(date, "MMDDYYYY").format("MM/DD/YYYY");
        query.push({ ModificationTimestamp: `≥${formattedDate}` });
      }
      const client = new FileMakerService();
      const responseCount: HubFileMakerResponse = await client.find(layoutName, query, { limit: 1 });
      console.log("responseCount: ", responseCount);
      const totalRecords = responseCount?.dataInfo?.foundCount || 0;

      // Start background processing
      (async () => {
        try {
          const chunkSize = 2000;
          const allHubs: IHubFileMaker[] = [];

          for (let offset = 1; offset <= totalRecords; offset += chunkSize) {
            const result: HubFileMakerResponse = await client.find(layoutName, query, {
              offset,
              limit: chunkSize,
            });
            allHubs.push(...result?.data || []);
          }

          console.log("Total hubs to sync: ", allHubs.length);
          if (purge) {
            await Hub.deleteMany({});
            console.log("Hub collection purged");
          }
          const hubData = await Promise.all(
            allHubs.map(async (hub: IHubFileMaker) => {
              const hubDoc = new Hub({
                ID: hub.fieldData.ID,
                CreationTimestamp: new Date(hub.fieldData.CreationTimestamp),
                CreatedBy: hub.fieldData.CreatedBy,
                ModificationTimestamp: new Date(hub.fieldData.ModificationTimestamp),
                ModifiedBy: hub.fieldData.ModifiedBy,
                umbrella: hub.fieldData.umbrella,
                course: hub.fieldData.course,
                name: hub.fieldData.name,
                classModel: hub.fieldData.classModel || "",
                date_start: hub.fieldData.date_start || "",
                date_end: hub.fieldData.date_end || "",
                ModifiedByWeb: hub.fieldData.ModifiedByWeb || "",
                recordId: hub.recordId.toString(),
              });
              return await hubDoc.save();
            })
          );
          console.log("Hubs synced: ", hubData.length);
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
