import { Schema, model, Document, Types } from 'mongoose';
import { ISection } from './section.model';
import { IPartnerSchool } from './partnerSchool.model';

export interface ISectionPartnerSchool extends Document {
    _id: Types.ObjectId;
    ID: string;
    recordId?: string;
    CreationTimestamp: string;
    CreatedBy: string;
    ModificationTimestamp: string;
    ModifiedBy: string;
    id_section: string | ISection;
    id_partnerSchool: string | IPartnerSchool;
    numEnrolled_c: number;
    num_roster_c: number;
    flag_removeWeb: string;
    flag_addWeb: string;
    ModifiedByWeb: string;
}

const sectionPartnerSchoolSchema = new Schema<ISectionPartnerSchool>({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    ID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    recordId: {
        type: String,
        required: false,
        unique: true,
        index: true
    },
    CreationTimestamp: {
        type: String,
        required: true
    },
    CreatedBy: {
        type: String,
        required: true
    },
    ModificationTimestamp: {
        type: String,
        required: true
    },
    ModifiedBy: {
        type: String,
        required: true
    },
    id_section: {
        type: String,
        ref: 'Section',
        required: true,
        index: true
    },
    id_partnerSchool: {
        type: String,
        ref: 'PartnerSchool',
        required: true,
        index: true
    },
    numEnrolled_c: {
        type: Number,
        default: 0
    },
    num_roster_c: {
        type: Number,
        default: 0
    },
    flag_removeWeb: {
        type: String,
        default: ''
    },
    flag_addWeb: {
        type: String,
        default: ''
    },
    ModifiedByWeb: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better query performance
sectionPartnerSchoolSchema.index({ id_section: 1, id_partnerSchool: 1 }, { unique: true });
sectionPartnerSchoolSchema.index({ recordId: 1 }, { unique: true });

// Virtual populate for section
sectionPartnerSchoolSchema.virtual('section', {
    ref: 'Section',
    localField: 'id_section',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for partner school
sectionPartnerSchoolSchema.virtual('partnerSchool', {
    ref: 'PartnerSchool',
    localField: 'id_partnerSchool',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware to ensure required fields
sectionPartnerSchoolSchema.pre('save', function(next) {
    if (!this.CreationTimestamp) {
        this.CreationTimestamp = new Date().toLocaleString();
    }
    if (!this.ModificationTimestamp) {
        this.ModificationTimestamp = new Date().toLocaleString();
    }
    next();
});

export const SectionPartnerSchool = model<ISectionPartnerSchool>('SectionPartnerSchool', sectionPartnerSchoolSchema); 