import { decodeToken } from '../../middleware/decodeJWT'
import { createRepository,deleteRepository,getAllRepositories,getRepository,unlinkAppFromGithub,linkAppToGithub,buildGitHubRepository } from '../controllers/repository'
export const repositoryRoute = (app) => {
  app.post('/createrepository',decodeToken,createRepository)
  app.post('/deleterepository/:id',decodeToken,deleteRepository)
  app.get('/repositories',decodeToken,getAllRepositories)
  app.get('/repository/:repositoryName',decodeToken,getRepository)
  app.put('/repository/unlink/:repositoryName',decodeToken,unlinkAppFromGithub)
  app.put('/repository/link/:repositoryName',decodeToken,linkAppToGithub)
  app.get('/repository/build/:repositoryName',decodeToken,buildGitHubRepository)
}