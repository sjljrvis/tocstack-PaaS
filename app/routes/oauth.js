import { initGithubOauth,getUserInfo,getRepositories } from '../controllers/oauth'
import { decodeToken } from '../../middleware/decodeJWT'

export const oauthRoute = (app) => {
  app.post('/github/oauth',decodeToken,initGithubOauth);
  app.get('/github/user',decodeToken,getUserInfo);
  app.get('/github/repos',decodeToken,getRepositories);
};

