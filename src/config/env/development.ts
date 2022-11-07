class ConfigDevelopment {
  env: string
  PORT: number
  API_BASE: string
  DATABASE_URL: string | undefined
  CORS_ORIGIN: string | string[]
  constructor() {
    this.env = 'development'
    this.PORT = Number(process.env.PORT)
    this.API_BASE = '/'
    this.DATABASE_URL = process.env.DATABASE_URL
    
    if (process.env.CORS_ORIGIN) {
      this.CORS_ORIGIN = process.env.CORS_ORIGIN.search(",") != -1 ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN
    }
    else {
      this.CORS_ORIGIN = "*"
    }
  }
}

export default new ConfigDevelopment()