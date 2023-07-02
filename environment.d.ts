declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV: string
      COSMOSDB_HOST: string
      COSMOSDB_PORT: string
      COSMOSDB_DBNAME: string
      COSMOSDB_USER: string
      COSMOSDB_PASSWORD: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
