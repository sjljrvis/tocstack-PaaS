export const monitorcontainerRoute = (app) => {
	
			app.get('/monitorcontainer', require(__base +'/app/controllers/monitorcontainer.js').monitorContainer);
			app.get('/viewgitcommits', require(__base +'/app/controllers/monitorcontainer.js').viewGitCommits);
			app.get('/fetchlogs', require(__base +'/app/controllers/monitorcontainer.js').fetchLogs);
			app.post('/executecommand', require(__base +'/app/controllers/monitorcontainer.js').executeCommand);
	};
