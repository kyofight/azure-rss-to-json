import { model, Schema, Model, Document } from 'mongoose'

export interface IShow extends Document {
  id: number
  title: string
  _title: string
  type: string
  link: string
  description: string
  author: string
  image: string
  category: string
  _category: [string]
  displayOrder: number
  episodeIds: [string]
  lastUpdate: Date
}

const ShowSchema: Schema = new Schema({
  id: { $type: Number, index: true },
  title: String,
  _title: String,
  type: { $type: String },
  link: String,
  description: String,
  author: String,
  image: String,
  category: String,
  _category: [String],
  displayOrder: { $type: Number, index: true },
  episodeIds: [{ $type: String, index: true }],
  lastUpdate: { $type: Date, default: Date.now }
}, {
  typeKey: '$type',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

ShowSchema.virtual('episodes', {
  ref: 'episode',
  localField: 'episodeIds',
  foreignField: 'id',
  justOne: false
})

export const ShowsModel: Model<IShow> = model<IShow>('show', ShowSchema)
