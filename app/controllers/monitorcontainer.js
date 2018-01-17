import { NGINX_DIRECTORY, NGINX_SITES_ENABLED } from '../../config'
import { read } from 'fs';
const fs = require('fs')
var exec = require('child_process').exec;

module.exports.monitorContainer = (req, res) => {
	let containerName = req.query.containerName;
	let containerDefault = `${req.query.containerName.split('_')[0]}_default`
	console.log(req.query.containerName)
	execute('docker inspect ' + req.query.containerName, (result) => {
		result = JSON.parse(result);
		if (result.length > 0) {
			let _result = [{
				State: result[0].State ,
				HostConfig: { ShmSize: result[0].HostConfig.ShmSize },
				NetworkSettings:  result[0].NetworkSettings.Networks
			}
			]
			console.log(_result);
			res.status(200).json(_result);
		}
		else {
			let _result = [{
				State: { Pid: 0 },
				HostConfig: { ShmSize: 0 },
				NetworkSettings: { IPAddress: 0, MacAddress: 0 }
			}
			]
			res.status(200).json(_result);
		}
	})
}

module.exports.executeCommand = (req, res) => {
	let containerName = req.query.containerName;
	let command = req.body.command
	execute('docker exec ' + req.query.containerName + " " + command, (result) => {
		res.status(200).send(result);
	})

}

module.exports.viewGitCommits = (req, res) => {

}
module.exports.fetchLogs = (req, res) => {
	let appName = req.params.app;
	execute(`docker logs ${appName}docker_web_1`, (result) => {
		res.send(result);
	})
}

module.exports.reloadNginx = (req, res) => {
	execute('sudo service nginx reload', (result) => {
		res.send(result);
	})
}
module.exports.createNginx = (req, res) => {
	let { repositoryName, nginx } = req.body
	fs.writeFile(`${NGINX_DIRECTORY}/${repositoryName}.tocstack.com`, nginx, (err, data) => {
		if (err) {
			console.error('Error in writing file', err)
			return;
		}
		else {
			console.log(`ln -s ${NGINX_DIRECTORY}/${repositoryName}.tocstack.com ${NGINX_SITES_ENABLED}/${repositoryName}.tocstack.com && sudo service nginx reload`);
			exec(`ln -s ${NGINX_DIRECTORY}/${repositoryName}.tocstack.com ${NGINX_SITES_ENABLED}/${repositoryName}.tocstack.com && sudo service nginx reload`, (err, stderr, stdout) => {
				if (err) {
					console.log("error in git-work-tree", err);
					return;
				}
				else {
					res.json({ status: true, message: "success" });
					req.app.db.models.Repository.findOneAndUpdate({ repositoryName: repositoryName }, { isDeployed: true }, (err, result) => {

					})
				}
			});
		}
	})
}
module.exports.updateNginx = (req, res) => {
	let { repositoryName, nginx } = req.body
	fs.writeFile(`${NGINX_DIRECTORY}/${repositoryName}.tocstack.com`, nginx, (err) => {
		if (err) {
			console.error('Error in writing file', err)
			return;
		}
		else {
			execute('sudo service nginx reload', (stdout) => {
				res.json({ status: true, message: "success" })
			})
		}
	})
}

var execute = (command, callback) => {
	exec(command, (error, stdout, stderr) => {
		callback(stdout);
	});
};