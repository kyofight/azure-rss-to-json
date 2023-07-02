import podcastConfig from './podcastConfig'
import { Context } from '@azure/functions'
import axios from 'axios'
import rssParser from './rssParser'
import { ObjectId } from 'mongoose'
import { IEpisode } from '../database/EpisodeSchema'
import { IShow } from '../database/ShowSchema'

// interface IShowConfig {
//   displayOrder: number
//   name: string
//   path: string
//   id: number
//   category: string
//   type: string
// }

interface IEpisodeData {
  guid: string
  title: string
  description: string
  link: string
  published: number
  created: number
  content: string
  enclosures: [
    {
      length: number
      type: string
      url: string
    }
  ]
  encoded: string
  subtitle: string
  duration: string
  season: number
  episodeType: string
  image: {
    href: string
  }
  show: ObjectId
  lastUpdate: Date
}

interface IGetShowsReturn {
  showData: [IShow?]
  episodeData: [Partial<IEpisode>?]
}

const parseShowCategory = (data: never): [string?] => {
  const keys = Object.keys(data)
  let values: [string?] = []
  for (const key of keys) {
    if (key === 'text') {
      values.push(data[key])
    } else if (data[key]) {
      values = values.concat(parseShowCategory(data[key])) as [string?]
    }
  }

  return values
}

// @ts-expect-error
export const getShows = async (context: Context): Promise<IGetShowsReturn> | Promise<void> => {
  try {
    const showData: [IShow?] = []
    let episodeData: [Partial<IEpisode>?] = []
    const axiosConfig = {
      baseURL: `${podcastConfig.rssBaseUrl}`
    }
    const libSynApiInstance = axios.create(axiosConfig)

    for (const show of podcastConfig.shows) {
      try {
        const response = await libSynApiInstance.get(show.path)
        const rss = await rssParser(response.data)
        const episodeIds: [string?] = []
        episodeData = episodeData.concat(
          rss.items.map((item: IEpisodeData): Partial<IEpisode> => {
            episodeIds.push(item.guid)
            return {
              ...item,
              id: item.guid,
              showId: show.id
            }
          })
        ) as [Partial<IEpisode>?]

        showData.push({
          ...rss,
          id: show.id,
          title: show.name,
          _title: rss.title,
          type: show.type,
          category: show.category,
          displayOrder: show.displayOrder,
          // @ts-expect-error
          _category: parseShowCategory(rss.category),
          // @ts-expect-error
          episodeIds
        })
      } catch (error) {
        context.log('get show api error', error)
      }
    }

    return {
      showData,
      episodeData
    }
  } catch (error) {
    context.log('getShows error', error)
  }
}
