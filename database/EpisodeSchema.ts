import { model, Schema, Model, Document } from 'mongoose'

export interface IEpisode extends Document {
  id: String
  showId: Number
  title: String
  description: String
  link: String
  published: Number
  created: Number
  content: String
  enclosures: [
    {
      length: Number
      type: String
      url: String
    }
  ]
  encoded: String
  subtitle: String
  duration: String
  season: Number
  episodeType: String
  image: {
    href: String
  }
  lastUpdate: Date
}

const EpisodeSchema: Schema = new Schema({
  id: { $type: String, index: true },
  showId: { $type: Number, index: true },
  title: String,
  description: String,
  link: String,
  published: { $type: Number, index: true },
  created: Number,
  content: String,
  enclosures: [
    {
      length: Number,
      type: { $type: String },
      url: String
    }
  ],
  encoded: String,
  subtitle: String,
  duration: String,
  season: Number,
  episodeType: String,
  image: {
    href: String
  },
  lastUpdate: { $type: Date, default: Date.now }
}, {
  typeKey: '$type',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

EpisodeSchema.virtual('show', {
  ref: 'show',
  localField: 'showId',
  foreignField: 'id',
  justOne: true
})

export const EpisodesModel: Model<IEpisode> = model<IEpisode>('episode', EpisodeSchema)
