# RSS Podcast to JSON

## Init
1. yarn global add azure-functions-core-tools@4 --unsafe-perm true
2. yarn
3. install docker and docker-compose to your system

## Dev Bootstrap for rss-process Timer
1. create a file in root directory “local.settings.json” with following content
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": ""
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*",
    "CORSCredentials": false
  }
}
```
2. docker-compose up
3. yarn watch
3. yarn dev:timer

## Dev Bootstrap for podcast-api API
1. source env.sh
2. yarn watch
3. yarn start:api


## API Documentation 
Swagger: https://kyofight.github.io/azure-rss-to-json/

## Todo
- fix types // @ts-expect-error AND any type
- alert and monitor for the endpoint health
- unit tests
