export {};

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MONGO_URL: string
        PORT: number
        SECRET_KEY: string
      }
    }
}