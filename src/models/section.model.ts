import { Schema, model, Document, Types } from 'mongoose';

export interface ISection extends Document {
    _id: Types.ObjectId;
    ID: string;
    CreationTimestamp: Date;
    CreatedBy: string;
    ModificationTimestamp: Date;
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
    recordId?: string;
}

const sectionSchema = new Schema<ISection>({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    ID: {
        type: String,
        required: true,
        unique: true
    },
    CreationTimestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    CreatedBy: {
        type: String,
        required: true
    },
    ModificationTimestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    ModifiedBy: {
        type: String,
        required: true
    },
    id_hub: {
        type: String,
        required: true
    },
    daysWeek: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^[A-Za-z](\s*-\s*[A-Za-z])*$/.test(v);
            },
            message: 'Days format should be like "M - F"'
        }
    },
    time_start: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(v);
            },
            message: 'Time format should be HH:MM:SS'
        }
    },
    time_end: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(v);
            },
            message: 'Time format should be HH:MM:SS'
        }
    },
    capacity_target: {
        type: Number,
        required: true,
        min: 0
    },
    capacity_overPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    capacity_max: {
        type: Number,
        required: true,
        min: 0
    },
    enrolled_c: {
        type: Number,
        required: true,
        min: 0
    },
    capacity_remaining_target_c: {
        type: Number,
        required: true,
        min: 0
    },
    capacity_remaining_max_c: {
        type: Number,
        required: true,
        min: 0
    },
    ModifiedByWeb: {
        type: String,
        default: ''
    },
    recordId: {
        type: String,
        unique: true,
        index: true,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false
});

sectionSchema.index({ recordId: 1 }, { unique: true });

// Add pre-save middleware to update ModificationTimestamp
sectionSchema.pre('save', function(next) {
    this.ModificationTimestamp = new Date();
    next();
});

// Add virtual for checking if section is full
sectionSchema.virtual('isFull').get(function() {
    return this.enrolled_c >= this.capacity_max;
});

// Add virtual for checking if section is over capacity
sectionSchema.virtual('isOverCapacity').get(function() {
    return this.enrolled_c > this.capacity_target;
});

export const Section = model<ISection>('Section', sectionSchema); 