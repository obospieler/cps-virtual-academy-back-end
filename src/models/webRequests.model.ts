import { Schema, model, Document } from 'mongoose';

export interface IWebRequest extends Document {
  id_hub: string;
  id_school: string;
  id_section: string;
  id_sectionNew?: string;
  nameFirst?: string;
  nameLast?: string;
  id_CPS?: string;
  id_student?: string;
  requestType: 'addStudent' | 'removeStudent' | 'moveSection' | string;
  json: string;
  ModifiedByWeb: string;
}

const webRequestSchema = new Schema<IWebRequest>(
  {
    id_hub: {
        type: String,
        ref: 'Hub',
        required: true
    },
    id_school: {
        type: String,
        ref: 'PartnerSchool',
        required: true
    },
    id_section: {
        type: String,
        ref: 'Section',
        required: true
    },
    id_sectionNew: { type: String },
    nameFirst: { type: String },
    nameLast: { type: String },
    id_CPS: { type: String },
    id_student: { type: String },
    requestType: { type: String, required: true },
    json: { type: String, required: true },
    ModifiedByWeb: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

webRequestSchema.index({ id_section: 1, id_school: 1 }, { unique: true });
webRequestSchema.index({ recordId: 1 }, { unique: true });

export const WebRequest = model<IWebRequest>('webRequests', webRequestSchema);
