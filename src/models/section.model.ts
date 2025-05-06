import { Schema, model, Document, Types } from 'mongoose';
import { IHub } from './hub.model';

export interface ISection extends Document {
    _id: Types.ObjectId;
    ID: string;
    CreationTimestamp: Date;
    CreatedBy: string;
    ModificationTimestamp: Date;
    ModifiedBy: string;
    id_hub: string;
    daysWeek?: string;
    time_start?: string;
    time_end?: string;
    capacity_target: number;
    capacity_overPercent: number;
    capacity_max: number;
    enrolled_c?: number;
    capacity_remaining_target_c: number;
    capacity_remaining_max_c: number;
    ModifiedByWeb: string;
    recordId?: string;
    hub?: IHub;
}

const sectionSchema = new Schema<ISection>({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    ID: {
        type: String,
        required: true
    },
    CreationTimestamp: {
        type: Date,
        default: Date.now
    },
    CreatedBy: {
        type: String,
    },
    ModificationTimestamp: {
        type: Date,
        default: Date.now
    },
    ModifiedBy: {
        type: String,
    },
    id_hub: {
        type: String,
        ref: 'Hub',
        required: true
    },
    daysWeek: {
        type: String,
    },
    time_start: {
        type: String,
    },
    time_end: {
        type: String,
    },
    capacity_target: {
        type: Number,
        min: 0
    },
    capacity_overPercent: {
        type: Number,
        min: 0,
        max: 1
    },
    capacity_max: {
        type: Number,
        min: 0
    },
    enrolled_c: {
        type: Number,
        min: 0
    },
    capacity_remaining_target_c: {
        type: Number,
        min: 0
    },
    capacity_remaining_max_c: {
        type: Number,
        min: 0
    },
    ModifiedByWeb: {
        type: String,
        default: ''
    },
    recordId: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false
});

// Set up the virtual populate with the name "Hub" (capital H)
sectionSchema.virtual('hub', {
    ref: 'Hub',
    localField: 'id_hub',
    foreignField: 'ID',
    justOne: true
});

sectionSchema.index({ recordId: 1 }, { unique: true });
sectionSchema.index({ ID: 1 }, { unique: true });

// Add pre-save middleware to update ModificationTimestamp
sectionSchema.pre('save', function(next) {
    this.ModificationTimestamp = new Date();
    next();
});;

export const Section = model<ISection>('Section', sectionSchema); 