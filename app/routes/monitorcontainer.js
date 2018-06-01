import { decodeToken } from '../../middleware/decodeJWT'
import { monitorContainer,fetchLogs,executeCommand,reloadNginx,createNginx_API,updateNginx_API } from '../controllers/monitorcontainer'

export const monitorcontainerRoute = (app) => {
	app.get('/monitorcontainer',decodeToken,monitorContainer);
	app.get('/fetchlogs/:app',decodeToken,fetchLogs);
	app.post('/executecommand',decodeToken,executeCommand);
	app.get('/reloadnginx',reloadNginx);
	app.post('/createnginx',createNginx_API);
	app.post('/updatenginx',updateNginx_API)
};
