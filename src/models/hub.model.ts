import { Schema, model, Document, Types } from 'mongoose';

export interface IHub extends Document {
    _id: Types.ObjectId;
    ID: string;
    recordId?: string;
    CreationTimestamp: Date;
    CreatedBy: string;
    ModificationTimestamp: Date;
    ModifiedBy: string;
    umbrella: string;
    course: string;
    name: string;
    classModel: string;
    date_start: string;
    date_end: string;
    ModifiedByWeb: string;
}

const hubSchema = new Schema<IHub>({
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
    umbrella: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    classModel: {
        type: String,
        default: ''
    },
    date_start: {
        type: String,
        default: ''
    },
    date_end: {
        type: String,
        default: ''
    },
    ModifiedByWeb: {
        type: String,
        default: ''
    }
}, {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
    versionKey: false
});

// Create index on ID field for faster lookups
hubSchema.index({ ID: 1 }, { unique: true });
hubSchema.index({ recordId: 1 }, { unique: true });

export const Hub = model<IHub>('Hub', hubSchema); 