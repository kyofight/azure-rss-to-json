const env = process.env
export default {
  env: env.APP_ENV ?? 'local',
  mongodb: {
    host: env.COSMOSDB_HOST ?? '',
    port: env.COSMOSDB_PORT ?? '',
    dbName: env.COSMOSDB_DBNAME ?? '',
    user: env.COSMOSDB_USER ?? '',
    password: env.COSMOSDB_PASSWORD ?? ''
  }
}
