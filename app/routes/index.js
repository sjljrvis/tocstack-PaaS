import { repositoryRoute } from './repository'
import { userRoute } from './users'
import { loginRoute } from './login'
import { monitorcontainerRoute } from './monitorcontainer'
import { oauthRoute } from './oauth'
export const indexRoute = (app) => {

  repositoryRoute(app);
  userRoute(app);
  loginRoute(app);
  monitorcontainerRoute(app);
  oauthRoute(app);
}
