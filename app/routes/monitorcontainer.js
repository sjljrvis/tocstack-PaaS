import { decodeToken } from '../../middleware/decodeJWT'

export const monitorcontainerRoute = (app) => {

	app.get('/monitorcontainer', decodeToken, require(__base + '/app/controllers/monitorcontainer.js').monitorContainer);
	app.get('/viewgitcommits', decodeToken, require(__base + '/app/controllers/monitorcontainer.js').viewGitCommits);
	app.get('/fetchlogs/:app', decodeToken, require(__base + '/app/controllers/monitorcontainer.js').fetchLogs);
	app.post('/executecommand', decodeToken, require(__base + '/app/controllers/monitorcontainer.js').executeCommand);
	app.get('/reloadnginx', require(__base + '/app/controllers/monitorcontainer.js').reloadNginx);
	app.post('/createnginx', require(__base + '/app/controllers/monitorcontainer.js').createNginx);
	app.post('/updatenginx', require(__base + '/app/controllers/monitorcontainer.js').updateNginx)
};
