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
    hub?: IHub;
    partnerSchool?: IPartnerSchool;
    section?: ISection;
    student?: IStudent;
}

const studentEnrollSchema = new Schema<IStudentEnroll>({
    ID: { type: String, required: true},
    CreationTimestamp: { type: String, required: true },
    CreatedBy: { type: String, required: true },
    ModificationTimestamp: { type: String, required: true },
    ModifiedBy: { type: String, required: true },
    id_hub: { 
        type: String, 
        ref: 'Hub',
        required: true 
    },
    id_partnerSchool: { 
        type: String, 
        ref: 'PartnerSchool',
        required: true 
    },
    id_section: { 
        type: String, 
        ref: 'Section'
    },
    id_student: { 
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
    recordId: { type: String, required: false }
}, {
    timestamps: false,
    versionKey: false
});

// Set up the virtual populate with the name "Hub" (capital H)
studentEnrollSchema.virtual('hub', {
    ref: 'Hub',
    localField: 'id_hub',
    foreignField: 'ID',
    justOne: true
}); 

// Set up the virtual populate with the name "PartnerSchool" (capital P)    
studentEnrollSchema.virtual('partnerSchool', {
    ref: 'PartnerSchool',
    localField: 'id_partnerSchool',
    foreignField: 'ID',
    justOne: true
});

// Set up the virtual populate with the name "Section" (capital S)
studentEnrollSchema.virtual('section', {
    ref: 'Section',
    localField: 'id_section',
    foreignField: 'ID',
    justOne: true
});

// Set up the virtual populate with the name "Student" (capital S)
studentEnrollSchema.virtual('student', {
    ref: 'Student',
    localField: 'id_student',
    foreignField: 'ID',
    justOne: true
});


studentEnrollSchema.index({ ID: 1 }, { unique: true });
studentEnrollSchema.index({ recordId: 1 }, { unique: true });

export const StudentEnroll = model<IStudentEnroll>('StudentEnroll', studentEnrollSchema); 