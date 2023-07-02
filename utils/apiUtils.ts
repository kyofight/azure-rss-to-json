import { Context } from '@azure/functions'
export enum API_DEFAULT {
  // IS_FORCE_REFRESH = 0,
  IS_WITH_SHOW = 0,
  PAGE_SIZE = 10,
  PAGE = 1,
  SELECT_EXCL = '-_id',
  SORT_BY = 'displayOrder',
  SORT_SEQ = 'asc',
  IS_WITH_EPISODE = 0,
  PAGE_SIZE_EP = 10,
  PAGE_EP = 1,
  SELECT_EXCL_EP = '-content -content_encoded -_id -enclosures._id',
  SORT_BY_EP = 'published',
  SORT_SEQ_EP = 'desc'
}

interface IQuery {
  isWithShow?: '0' | '1' | 'false' | 'true' | undefined
  pageSize?: string
  page?: string
  fieldSearch?: string
  fieldSearchQuery?: string
  selectExcl?: string
  sortBy?: string
  sortSeq?: string
  isWithEpisode?: string
  pageSizeEp?: string
  pageEp?: string
  fieldSearchEp?: string
  fieldSearchQueryEp?: string
  selectExclEp?: string
  sortByEp?: string
  sortSeqEp?: string
}

interface IQueryParsed {
  isWithShow: boolean
  pageSize: number
  page: number
  fieldSearch: [string]
  fieldSearchQuery: [string]
  selectExcl: string
  sortBy: string
  sortSeq: string
  isWithEpisode: boolean
  pageSizeEp: number
  pageEp: number
  fieldSearchEp: [string]
  fieldSearchQueryEp: [string]
  selectExclEp: string
  sortByEp: string
  sortSeqEp: string
}

interface ICustomerHeader {
  'Content-Type': 'application/json'
  'Cache-Control'?: string
}

export const response = (context: Context, body: any | string, status = 200): void => {
  const headers: ICustomerHeader = {
    'Content-Type': 'application/json'
  }
  if (status === 200) {
    // cache for 5 mins
    headers['Cache-Control'] = 'public, max-age=3000'
  }
  context.res = {
    headers,
    status,
    body
  }
}

export const parseQuery = (query: IQuery): IQueryParsed => {
  // const isForceRefresh = !!(['true', '1'].includes(query?.isForceRefresh?.trim()) ?? API_DEFAULT.IS_FORCE_REFRESH)
  const isWithShow = !!(['true', '1'].includes(query?.isWithShow?.trim() ?? '') ?? API_DEFAULT.IS_WITH_SHOW)
  const pageSize = Number(query.pageSize?.trim() ?? API_DEFAULT.PAGE_SIZE)
  const page = Number(query.page?.trim() ?? API_DEFAULT.PAGE)
  const fieldSearch = JSON.parse(query.fieldSearch?.trim() ?? '[]')
  const fieldSearchQuery = JSON.parse(query.fieldSearchQuery?.trim() ?? '[]')
  const selectExcl = query.selectExcl?.trim() ?? API_DEFAULT.SELECT_EXCL
  const sortBy = query.sortBy?.trim() ?? API_DEFAULT.SORT_BY
  const sortSeq = query.sortSeq?.trim() ?? API_DEFAULT.SORT_SEQ
  const isWithEpisode = !!(['true', '1'].includes(query?.isWithEpisode?.trim() ?? '') ?? API_DEFAULT.IS_WITH_EPISODE)
  const pageSizeEp = Number(query.pageSizeEp?.trim() ?? API_DEFAULT.PAGE_SIZE_EP)
  const pageEp = Number(query.pageEp?.trim() ?? API_DEFAULT.PAGE_EP)
  const fieldSearchEp = JSON.parse(query.fieldSearchEp?.trim() ?? '[]')
  const fieldSearchQueryEp = JSON.parse(query.fieldSearchQueryEp?.trim() ?? '[]')
  const selectExclEp = query.selectExclEp?.trim() ?? API_DEFAULT.SELECT_EXCL_EP
  const sortByEp = query.sortByEp?.trim() ?? API_DEFAULT.SORT_BY_EP
  const sortSeqEp = query.sortSeqEp?.trim() ?? API_DEFAULT.SORT_SEQ_EP

  return {
    // isForceRefresh,
    isWithShow,
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
  }
}

export const getSearchQuery = (fieldSearch: [string], fieldSearchQuery: [string]): { [key: string]: string } => {
  let fieldQuery = {}
  if (fieldSearch.length > 0) {
    fieldQuery = fieldSearch.reduce((result, field, index) => {
      return {
        ...result,
        [field]: fieldSearchQuery[index]
      }
    }, {})
  }

  return fieldQuery
}
