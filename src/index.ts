import { env } from './config/env'
import app from './app'
import {prisma} from './databases/db'

const PORT = env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
