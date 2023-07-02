import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import '../database/EpisodeSchema'
import { ShowsModel } from '../database/ShowSchema'
import { connect } from '../database/mongodb'
import { getSearchQuery, parseQuery, response } from '../utils/apiUtils'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const timeStamp = new Date().toISOString()
  context.log('podcast-shows-get HTTP trigger function processing a request.', timeStamp)

  try {
    const {
      pageSize,
      page,
      fieldSearch,
      fieldSearchQuery,
      selectExcl,
      sortBy,
      sortSeq,
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
    const fieldQuery = getSearchQuery(fieldSearch, fieldSearchQuery)
    let query = ShowsModel.find(fieldQuery).select(selectExcl)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      // @ts-expect-error
      .sort({ [sortBy]: sortSeq })

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

    response(context, {
      data: data.map((item) => {
        const show = item.toJSON()
        // @ts-expect-error
        const episodes = show.episodes
        return {
          ...show,
          // @ts-expect-error
          episodeIds: episodes?.map((e) => e.id)
        }
      }),
      query: {
        page,
        pageSize,
        sortBy,
        sortSeq,
        fieldQuery,
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
    context.log('podcast-shows-get HTTP trigger Unexpected error:', e.toString())
    response(context, { message: 'Unexpected error' }, 400)
  } finally {
    context.log('podcast-shows-get HTTP trigger function ended!', timeStamp)
  }
}

export default httpTrigger
