import { NGINX_DIRECTORY, NGINX_SITES_ENABLED } from '../../config'
import fs from "fs"
import { exec } from "child_process"
import { read } from 'fs';


export const monitorContainer = (req, res) => {
	let { containerName } = req.query;
	let containerDefault = `${containerName.split('_')[0]}_default`;

	exec(`docker inspect ${containerName}`, (err, stdout, stderr) => {
		let result = JSON.parse(stdout);
		if (result.length > 0) {
			let _result = [{
				State: result[0].State,
				HostConfig: { ShmSize: result[0].HostConfig.ShmSize },
				NetworkSettings: result[0].NetworkSettings.Networks
			}]
			res.status(200).json(_result);
		} else {
			let _result = [{
				State: { Pid: 0 },
				HostConfig: { ShmSize: 0 },
				NetworkSettings: { IPAddress: 0, MacAddress: 0 }
			}]
			res.status(200).json(_result);
		}
	})
}

export const executeCommand = (req, res) => {
	const { containerName, command } = req.body;
	exec(`docker exec ${containerName} ${command}`, (err, stdout, stderr) => {
		res.status(200).send(stdout);
	})
}

export const fetchLogs = (req, res) => {
	const { app } = req.params;
	exec(`docker logs ${app}docker_web_1`, (err, stdout, stderr) => {
		res.status(200).send(stdout);
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
module.exports.pauseContainer = (req, res) => {
	let appName = req.params.app;
	execute(`docker pause ${appName}docker_web_1`, (result) => {
		res.send(result);
	})
}
var execute = (command, callback) => {
	exec(command, (error, stdout, stderr) => {
		callback(stdout);
	});
};