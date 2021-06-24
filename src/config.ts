import dotenv from "dotenv"

dotenv.config()

export const BACKEND_HOST = process.env.BACKEND_HOST
export const BACKEND_HOST_TESTNET = process.env.BACKEND_HOST_TESTNET
export const GRAPHQL_HOST = process.env.GRAPHQL_HOST
export const GRAPHQL_HOST_TESTNET = process.env.GRAPHQL_HOST_TESTNET
// export const TXQ_HOST = "http://localhost:8097/api/v1"
// export const TXQ_HOST_TESTNET = "http://localhost:8098/api/v1"
