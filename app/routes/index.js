import {repositoryRoute} from './repository'
import {userRoute} from './users'
import {loginRoute} from './login'
import {monitorcontainerRoute} from './monitorcontainer'

export const indexRoute = (app) => {
   
  repositoryRoute(app) ;
  userRoute(app);
  loginRoute(app);
  monitorcontainerRoute(app);

}
