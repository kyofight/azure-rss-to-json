import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import '../database/ShowSchema'
import { EpisodesModel } from '../database/EpisodeSchema'
import { connect } from '../database/mongodb'
import { getSearchQuery, parseQuery, response } from '../utils/apiUtils'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const timeStamp = new Date().toISOString()
  context.log('podcast-episodes-get HTTP trigger function processing a request.', timeStamp)

  try {
    const {
      selectExcl,
      pageSizeEp,
      pageEp,
      fieldSearchEp,
      fieldSearchQueryEp,
      selectExclEp,
      sortByEp,
      sortSeqEp,
      isWithShow
    } = parseQuery(req.query)

    await connect(context)
    const fieldQuery = getSearchQuery(fieldSearchEp, fieldSearchQueryEp)
    let query = EpisodesModel.find(fieldQuery).select(selectExclEp)
      .skip((pageEp - 1) * pageSizeEp)
      .limit(pageSizeEp)
      // @ts-expect-error
      .sort({ [sortByEp]: sortSeqEp })

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
        pageEp,
        pageSizeEp,
        sortByEp,
        sortSeqEp,
        fieldQuery,
        selectExclEp,
        selectExcl,
        isWithShow
      }
    })
    // await disconnect(context)
  } catch (e) {
    // @ts-expect-error
    context.log('podcast-episodes-get HTTP trigger Unexpected error:', e.toString())
    response(context, { message: 'Unexpected error' }, 400)
  } finally {
    context.log('podcast-episodes-get HTTP trigger function ended!', timeStamp)
  }
}

export default httpTrigger
