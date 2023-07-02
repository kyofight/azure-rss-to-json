import * as Mongoose from 'mongoose'
import { IEpisode } from './EpisodeSchema'
import { IShow } from './ShowSchema'
import { Connection, Model } from 'mongoose'
import { Context } from '@azure/functions'
import config from '../config'

let database: Mongoose.Connection
const connectionUrl = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbName}`
const connectionStr = `${connectionUrl}?${config.env === 'local' ? 'authSource=admin' : `ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=${config.mongodb.appName}`}`

// @ts-expect-error
export const connect = async (context: Context): Promise<Connection> | Promise<void> => {
  if (typeof database !== 'undefined' && [Mongoose.STATES.connected].includes(database.readyState)) {
    return
  }

  const promise = Mongoose.connect(connectionStr)

  database = Mongoose.connection

  database.once('open', () => {
    context.log('Connected to database')
  })

  database.on('error', () => {
    context.log('Error connecting to database')
  })

  // @ts-expect-error
  return await promise
}

export const disconnect = async (context: Context): Promise<void> => {
  if (typeof database === 'undefined') {
    return
  }
  database.once('close', () => {
    context.log('Disconnected to database')
  })

  return await Mongoose.disconnect()
}

export const bulkWipeAndWriteToDb = async (Model: Model<IShow> | Model<IEpisode>, data: [IShow?] | [Partial<IEpisode>?] | undefined, context: Context): Promise<void> => {
  try {
    // @ts-expect-error
    const docIds: [string | number] = []
    // @ts-expect-error
    const bulkOps: [never] = data.map(doc => {
      // @ts-expect-error
      docIds.push(doc.id)
      return {
        updateOne: {
          // @ts-expect-error
          filter: { id: doc.id },
          update: { ...doc, lastUpdate: Date.now() },
          upsert: true
        }
      }
    })

    await Model.bulkWrite(bulkOps)
    // @ts-expect-error
    await Model.deleteMany({ id: { $nin: docIds } })
    // @ts-expect-error
  } catch (e: Error) {
    context.log(`Error writing to ${Model.toString()}`, e.toString(), Date())
  }
}
