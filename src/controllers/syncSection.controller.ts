import { Request, Response } from 'express';
import moment from 'moment';
import { ResponseUtil } from '../utils/response.util';
import { Section } from '../models/section.model';
import FileMakerService from '../services/filemaker.service';

function processFileMakerRecord(record: any) {
  const { fieldData, recordId, modId } = record;
  const now = new Date();
  return {
    ...fieldData,
    fileMakerRecordId: recordId,
    fileMakerModId: modId,
    _mongoCreatedAt: now,
    _mongoModifiedAt: now,
    _mongoEdited: false
  };
}

async function getRecordCount(client: any, layoutName: string, query: any[]): Promise<number> {
  try {
    const res = await client.find(layoutName, query, { limit: 1 });
    return res?.dataInfo?.foundCount || 0;
  } catch (error: any) {
    console.error(`Error getting record count for ${layoutName}:`, error.message);
    throw error;
  }
}

async function fetchAllRecords(client: any, layoutName: string, totalCount: number, query: any[]): Promise<any[]> {
  const limit = 1000;
  const loopCounter = Math.ceil(totalCount / limit);
  const allRecords: any[] = [];

  for (let index = 1; index <= loopCounter; index++) {
    const offset = index === 1 ? 1 : (index - 1) * limit + 1;
    const res = await client.find(layoutName, query, { limit, offset });
    const records = res.data || [];
    allRecords.push(...records.map(processFileMakerRecord));
  }

  return allRecords;
}

export class SectionSyncController {
  static async syncSections(req: Request, res: Response) {
    try {
      const date = req.body.date || null;
      const purge = req.body.purge || false;
      const totalCount = await SectionSyncController.doSectionSync(date, purge);
      return res.json(ResponseUtil.success(
        { total_count: totalCount },
        `Syncing sections in background: ${totalCount}`
      ));
    } catch (error: any) {
      console.error('Error in syncSections:', error);
      return res.status(500).json(ResponseUtil.serverError(error.message));
    }
  }

  static async doSectionSync(date: string | null = null, purge = false): Promise<number> {
    const client = new FileMakerService();
    console.log('Initializing FileMaker client');
    const layoutName = 'sections';
    const query: any[] = [];

    if (date) {
      const formattedDate = moment(date, 'MMDDYYYY').format('MM/DD/YYYY');
      query.push({ zzModifiedTS: `≥${formattedDate}` });
    }

    query.push({ ModifiedBy: 'node-server', omit: 'true' });

    try {
      // First verify if the layout exists
      console.log(`Verifying layout '${layoutName}' exists...`);
      const layouts = await client.layouts();
      const availableLayouts = layouts?.layouts || [];
      const allLayoutNames: string[] = availableLayouts.flatMap((layout: any) =>
        Array.isArray(layout.folderLayoutNames) ? layout.folderLayoutNames : []
      );
      
      console.log('All available layout names:', allLayoutNames);
      const layoutExists = allLayoutNames.includes(layoutName);
      
      if (!layoutExists) {
        console.error(`Layout '${layoutName}' not found. Available layouts:`, availableLayouts.map((l: any) => l.name).join(', '));
        throw new Error(`Layout '${layoutName}' does not exist in FileMaker database`);
      }

      console.log(`Layout '${layoutName}' verified, proceeding with record count...`);
      const totalCount = await getRecordCount(client, layoutName, query);
      if (!totalCount) {
        console.log('No sections to sync from FileMaker');
        await client.destroy();
        return 0;
      }

      console.log(`${moment().format('MM/DD/YYYY hh:mm A')} - Found ${totalCount} section records to sync`);
      await SectionSyncController.fetchAndUpdateSections(client, layoutName, purge, totalCount, query);
      await client.destroy();
      return totalCount;
    } catch (error: any) {
      await client.destroy();
      console.error('Error in doSectionSync:', error.message);
      if (error.response?.data?.messages) {
        console.error('FileMaker API Error Details:', JSON.stringify(error.response.data.messages, null, 2));
      }
      throw error;
    }
  }

  static async fetchAndUpdateSections(client: any, layoutName: string, purge: boolean, totalCount: number, query: any[] = []) {
    try {
      const allSections = await fetchAllRecords(client, layoutName, totalCount, query);
      console.log(`${moment().format('MM/DD/YYYY hh:mm A')} - Retrieved ${allSections.length} section records`);

      if (purge) {
        await Section.deleteMany({});
        const BATCH_SIZE = 1000;
        for (let i = 0; i < allSections.length; i += BATCH_SIZE) {
          await Section.insertMany(allSections.slice(i, i + BATCH_SIZE));
        }
      } else {
        if (allSections.length > 0) {
          const bulkOps = allSections.map(doc => ({
            updateOne: {
              filter: { fileMakerRecordId: doc.fileMakerRecordId },
              update: { $set: doc },
              upsert: true
            }
          }));
          await Section.bulkWrite(bulkOps);
        }
      }

      console.log('Section sync complete');
    } catch (error: any) {
      console.error('Error syncing sections:', error.message);
      throw error;
    }
  }
} 