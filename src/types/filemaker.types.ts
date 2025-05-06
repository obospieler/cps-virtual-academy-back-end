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


export interface ISectionFilemaker {
  fieldData: {
    ID: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    id_hub: string;
    daysWeek: string;
    time_start: string;
    time_end: string;
    capacity_target: number;
    capacity_overPercent: number;
    capacity_max: number;
    enrolled_c: number;
    capacity_remaining_target_c: number;
    capacity_remaining_max_c: number;
    ModifiedByWeb: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface SectionFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: ISectionFilemaker[];
  [key: string]: any;
}


export interface IPartnerSchoolsFilemaker {
  fieldData: {
    ID: string;
    recordId?: string;
    xx_email_auth_user: string;
    schoolName: string;
    CreationTimestamp: Date;
    CreatedBy: string;
    ModificationTimestamp: Date;
    ModifiedBy: string;
    ModifiedByWeb: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface PartnerSchoolsFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: IPartnerSchoolsFilemaker[];
  [key: string]: any;
}


export interface ISectionPartnerSchoolsFilemaker {
  fieldData: {
    ID: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    id_section: string;
    id_partnerSchool: string;
    numEnrolled_c: number;
    num_roster_c: number;
    flag_removeWeb: string;
    flag_addWeb: string;
    ModifiedByWeb: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface SectionsPartnerSchoolsFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: ISectionPartnerSchoolsFilemaker[];
  [key: string]: any;
}

export interface IStudentEnrolledFilemaker {
  fieldData: {
    ID: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    id_hub: string;
    id_partnerSchool: string;
    id_section: string;
    id_student: string;
    status_roster: string;
    removeReason: string;
    removeReason_other: string;
    removeReason_additionalContext: string;
    flag_enrolled: number;
    flag_removeWeb: string;
    flag_addWeb: string;
    temp_firstName: string;
    temp_lastName: string;
    temp_CPSID: string;
    ModifiedByWeb: string;
    id_sectionMoveWeb: string;
    flag_moveWeb: string;
    recordId: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface StudentEnrolledFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: IStudentEnrolledFilemaker[];
  [key: string]: any;
}


export interface IStudentFilemaker {
  fieldData: {
    ID: string;
    recordId?: string;
    id_parsch: string;
    name_first: string;
    name_last: string;
    score1: string;
    score2: string;
    GPA: string;
    grade_current: string;
    flag_alg_complete: string;
    CPSID: string;
    name_full: string;
    attendance: string;
    GPA_waiver_flag: string;
    attendance_waiver_flag: string;
    act: string;
    sat_math: string;
    sat_eng: string;
    alex: string;
    rtw: string;
    mg_alg_school_elig: number;
    mg_geo_school_elig: number;
    mg_span_school_elig: string;
    mg_eng_school_elig: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    ModifiedByWeb: string;
    flag_addWeb: string;
  };
  portalData: Record<string, any>;
  recordId: string;
  modId: string;
}

export interface StudentFileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: IStudentFilemaker[];
  [key: string]: any;
}