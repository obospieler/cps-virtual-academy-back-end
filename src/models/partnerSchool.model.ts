import { Schema, model, Document, Types } from 'mongoose';

export interface IPartnerSchool extends Document {
    _id: Types.ObjectId;
    ID: string;
    recordId?: string;
    xx_email_auth_user: string;
    schoolName: string;
    CreationTimestamp: Date;
    CreatedBy: string;
    ModificationTimestamp: Date;
    ModifiedBy: string;
    ModifiedByWeb: string;
}

const partnerSchoolSchema = new Schema<IPartnerSchool>({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    ID: {
        type: String,
        required: true
    },
    recordId: {
        type: String,
        required: false
    },
    xx_email_auth_user: {
        type: String,
        default: ''
    },
    schoolName: {
        type: String,
        required: true
    },
    CreationTimestamp: {
        type: Date,
        required: true
    },
    CreatedBy: {
        type: String,
        required: true
    },
    ModificationTimestamp: {
        type: Date,
        required: true
    },
    ModifiedBy: {
        type: String,
        required: true
    },
    ModifiedByWeb: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Create index on ID field for faster lookups
partnerSchoolSchema.index({ ID: 1 }, { unique: true });
partnerSchoolSchema.index({ recordId: 1 }, { unique: true });

// Create index on schoolName for faster searches
partnerSchoolSchema.index({ schoolName: 1 });

export const PartnerSchool = model<IPartnerSchool>('PartnerSchool', partnerSchoolSchema); 