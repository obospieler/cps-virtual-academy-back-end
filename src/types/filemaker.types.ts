export interface IHubFileMaker {
  fieldData: {
    ID: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    umbrella: string;
    course: string;
    name: string;
    classModel?: string;
    date_start?: string;
    date_end?: string;
    ModifiedByWeb?: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface HubFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: IHubFileMaker[];
  [key: string]: any;
}
