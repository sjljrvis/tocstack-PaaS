import { initGithubOauth,getUserInfo } from '../controllers/oauth'
import { decodeToken } from '../../middleware/decodeJWT'

export const oauthRoute = (app) => {
  app.post('/github/oauth',decodeToken,initGithubOauth);
  app.get('/github/user',decodeToken,getUserInfo);
};

