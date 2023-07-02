import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import '../database/EpisodeSchema'
import { ShowsModel } from '../database/ShowSchema'
import { connect } from '../database/mongodb'
import { getSearchQuery, parseQuery, response } from '../utils/apiUtils'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const timeStamp = new Date().toISOString()
  context.log('podcast-show-get HTTP trigger function processing a request.', timeStamp)

  try {
    const showId = req.params.showId?.trim() ?? ''
    if (showId === '') {
      response(context, { message: 'Missing showId' }, 400)
      return
    }

    const {
      selectExcl,
      isWithEpisode,
      pageSizeEp,
      pageEp,
      fieldSearchEp,
      fieldSearchQueryEp,
      selectExclEp,
      sortByEp,
      sortSeqEp
    } = parseQuery(req.query)

    await connect(context)
    let query = ShowsModel.findOne({ id: showId }).select(selectExcl)
    const fieldQueryEp = getSearchQuery(fieldSearchEp, fieldSearchQueryEp)
    if (isWithEpisode) {
      // @ts-expect-error
      query = query.populate({
        path: 'episodes',
        match: fieldQueryEp,
        select: selectExclEp,
        options: {
          sort: { [sortByEp]: sortSeqEp },
          skip: (pageEp - 1) * pageSizeEp,
          limit: pageSizeEp
        }
      })
    }

    const data = await query

    const show = data?.toJSON()
    // @ts-expect-error
    const episodeIds = show?.episodes?.map((e) => e.id)

    response(context, {
      data: {
        ...show,
        episodeIds
      },
      query: {
        selectExcl,
        isWithEpisode,
        pageEp,
        pageSizeEp,
        sortByEp,
        sortSeqEp,
        fieldQueryEp,
        selectExclEp
      }
    })
    // await disconnect(context)
  } catch (e) {
    // @ts-expect-error
    context.log('podcast-show-get HTTP trigger Unexpected error:', e.toString())
    response(context, { message: 'Unexpected error' }, 400)
  } finally {
    context.log('podcast-show-get HTTP trigger function ended!', timeStamp)
  }
}

export default httpTrigger
