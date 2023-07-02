import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import '../database/ShowSchema'
import { EpisodesModel } from '../database/EpisodeSchema'
import { connect } from '../database/mongodb'
import { parseQuery, response } from '../utils/apiUtils'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const timeStamp = new Date().toISOString()
  context.log('podcast-episode-get HTTP trigger function processing a request.', timeStamp)

  try {
    const episodeId = req.params.episodeId?.trim() ?? ''
    if (episodeId === '') {
      response(context, { message: 'Missing episodeId' }, 400)
      return
    }

    const {
      selectExcl,
      isWithShow,
      selectExclEp
    } = parseQuery(req.query)

    await connect(context)
    let query = EpisodesModel.findOne({ id: episodeId }).select(selectExclEp)

    if (isWithShow) {
      // @ts-expect-error
      query = query.populate({
        path: 'show',
        select: `-episodeIds ${selectExcl}`
      })
    }

    const data = await query

    response(context, {
      data,
      query: {
        selectExcl,
        selectExclEp,
        isWithShow
      }
    })
    // await disconnect(context)
  } catch (e) {
    // @ts-expect-error
    context.log('podcast-episode-get HTTP trigger Unexpected error:', e.toString())
    response(context, { message: 'Unexpected error' }, 400)
  } finally {
    context.log('podcast-episode-get HTTP trigger function ended!', timeStamp)
  }
}

export default httpTrigger
