import { Schema, model, Document, Types } from 'mongoose';

export interface IStudent extends Document {
    _id: Types.ObjectId;
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
}

const studentSchema = new Schema<IStudent>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    ID: { type: String, required: true, unique: true },
    recordId: { type: String, unique: true, index: true, required: false },
    id_parsch: { type: String, default: '' },
    name_first: { type: String, required: true },
    name_last: { type: String, required: true },
    score1: { type: String, default: '' },
    score2: { type: String, default: '' },
    GPA: { type: String, default: '' },
    grade_current: { type: String, default: '' },
    flag_alg_complete: { type: String, default: '' },
    CPSID: { type: String, required: true, unique: true },
    name_full: { type: String, required: true },
    attendance: { type: String, default: '' },
    GPA_waiver_flag: { type: String, default: '' },
    attendance_waiver_flag: { type: String, default: '' },
    act: { type: String, default: '' },
    sat_math: { type: String, default: '' },
    sat_eng: { type: String, default: '' },
    alex: { type: String, default: '' },
    rtw: { type: String, default: '' },
    mg_alg_school_elig: { type: Number, default: 0 },
    mg_geo_school_elig: { type: Number, default: 0 },
    mg_span_school_elig: { type: String, default: '' },
    mg_eng_school_elig: { type: String, default: '' },
    CreationTimestamp: { type: String, required: true },
    CreatedBy: { type: String, required: true },
    ModificationTimestamp: { type: String, required: true },
    ModifiedBy: { type: String, required: true },
    ModifiedByWeb: { type: String, default: '' },
    flag_addWeb: { type: String, default: '' }
}, {    
    timestamps: false,
    versionKey: false
});

studentSchema.index({ ID: 1 }, { unique: true });
studentSchema.index({ recordId: 1 }, { unique: true });
export const Student = model<IStudent>('Student', studentSchema); 