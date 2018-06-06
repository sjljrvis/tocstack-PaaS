import { initGithubOauth,saveUserInfo } from '../controllers/oauth'
import { decodeToken } from '../../middleware/decodeJWT'

export const oauthRoute = (app) => {
  app.post('/github/oauth',decodeToken,initGithubOauth);
  app.post('/github/save',decodeToken,saveUserInfo);
};

