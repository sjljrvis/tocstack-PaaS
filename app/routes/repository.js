import { decodeToken } from '../../middleware/decodeJWT'
import { createRepository,deleteRepository,getAllRepositories,getRepository } from '../controllers/repository'
export const repositoryRoute = (app) => {
  app.post('/createrepository',decodeToken,createRepository)
  app.post('/deleterepository/:id',decodeToken,deleteRepository)
  app.get('/repositories',decodeToken,getAllRepositories)
  app.get('/repository/:repositoryName',decodeToken,getRepository)

}