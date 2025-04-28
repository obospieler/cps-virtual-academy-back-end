import { Schema, model, Document, Types } from 'mongoose';
import { IHub } from './hub.model';
import { IPartnerSchool } from './partnerSchool.model';
import { ISection } from './section.model';
import { IStudent } from './student.model';

export interface IStudentEnroll extends Document {
    ID: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    hub: string | IHub;
    partnerSchool: string | IPartnerSchool;
    section: string | ISection;
    student: string | IStudent;
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
}

const studentEnrollSchema = new Schema<IStudentEnroll>({
    ID: { type: String, required: true, unique: true },
    CreationTimestamp: { type: String, required: true },
    CreatedBy: { type: String, required: true },
    ModificationTimestamp: { type: String, required: true },
    ModifiedBy: { type: String, required: true },
    hub: { 
        type: String, 
        ref: 'Hub',
        required: true 
    },
    partnerSchool: { 
        type: String, 
        ref: 'PartnerSchool',
        required: true 
    },
    section: { 
        type: String, 
        ref: 'Section',
        required: true 
    },
    student: { 
        type: String, 
        ref: 'Student',
        required: true 
    },
    status_roster: { type: String, default: 'Not Enrolled' },
    removeReason: { type: String, default: '' },
    removeReason_other: { type: String, default: '' },
    removeReason_additionalContext: { type: String, default: '' },
    flag_enrolled: { type: Number, default: 0 },
    flag_removeWeb: { type: String, default: '' },
    flag_addWeb: { type: String, default: '' },
    temp_firstName: { type: String, default: '' },
    temp_lastName: { type: String, default: '' },
    temp_CPSID: { type: String, default: '' },
    ModifiedByWeb: { type: String, default: '' },
    id_sectionMoveWeb: { type: String, default: '' },
    flag_moveWeb: { type: String, default: '' },
    recordId: { type: String, unique: true, index: true, required: false }
}, {
    timestamps: false,
    versionKey: false
});

studentEnrollSchema.index({ ID: 1 }, { unique: true });
studentEnrollSchema.index({ recordId: 1 }, { unique: true });

export const StudentEnroll = model<IStudentEnroll>('StudentEnroll', studentEnrollSchema); 