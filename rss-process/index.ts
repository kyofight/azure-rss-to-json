import { AzureFunction, Context, Timer } from '@azure/functions'
import { getShows } from './libsynUtil'
import { bulkWipeAndWriteToDb, connect, disconnect } from '../database/mongodb'
import { EpisodesModel } from '../database/EpisodeSchema'
import { ShowsModel } from '../database/ShowSchema'
// import { writeFileSync } from 'fs'

const timerTrigger: AzureFunction = async function (context: Context, myTimer: Timer): Promise<void> {
  const timeStamp = new Date().toISOString()

  if (myTimer.isPastDue) {
    context.log('RSS Process Timer function is running late!')
  }
  context.log('RSS Process Timer trigger function start!', timeStamp)

  try {
    await connect(context)
    const { showData, episodeData } = await getShows(context) ?? {}

    // writeFileSync('./showData.json', JSON.stringify(showData, null, 2))
    // writeFileSync('./episodeData.json', JSON.stringify(episodeData, null, 2))

    // save shows and episode data to cosmos db
    await bulkWipeAndWriteToDb(ShowsModel, showData, context)
    await bulkWipeAndWriteToDb(EpisodesModel, episodeData, context)

    await disconnect(context)
  } catch (e) {
    // @ts-expect-error
    context.log('RSS Process Unexpected error:', e.toString(), timeStamp)
  } finally {
    context.log('RSS Process Timer trigger function ended!', timeStamp)
  }
}

export default timerTrigger
