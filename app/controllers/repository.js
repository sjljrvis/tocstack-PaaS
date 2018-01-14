const fs = require('fs')
var exec = require('child_process').exec;
import { execshell } from '../helper/functions'
import { rootDirectory } from '../helper/constant'
import { callDockerPath, shellScriptPath,token } from '../../config'
import request from 'request'
module.exports.createRepository = (req, res) => {

	if (req.JWTData) {

		let userName = req.JWTData.userName;
		let repositoryName = req.body.repositoryName;
		let language = req.body.language;

		try {
			execshell(`cd && cd ${rootDirectory + userName} && sudo -u www-data mkdir ${repositoryName}`,
				(err, stdout) => {
					if (err) {
						return res.status(200).json({ status: 'false', message: 'Repository already exists please choose another name' });
					}
					else {
						req.app.db.models.Repository.findOne({ repositoryName: repositoryName }, (err, repository) => {
							if (err) {
								console.log("Error", err);
								return;
							}
							if (repository) {
								res.json({ status: 'false', message: 'Repository already exists please choose another name' })
							}
							else {
								var repoPath = rootDirectory + userName + '/' + repositoryName
								execute('git init --bare ' + repoPath, (result) => {
									fs.writeFileSync(repoPath + "/calldocker.js", fs.readFileSync(`${callDockerPath}/calldocker.js`));
									fs.writeFileSync(repoPath + "/hooks/post-receive", fs.readFileSync(`${shellScriptPath}/post-receive`));
									fs.writeFileSync(repoPath + "/containerName.txt", fs.readFileSync(`${shellScriptPath}/containerName.txt`));
									/*'chmod +x ' + repoPath + '/hooks/post-receive'*/
									exec(`chmod +x  ${repoPath + '/hooks/post-receive'} && chown www-data:www-data -R ${rootDirectory + userName} && chown www-data:www-data -R ${rootDirectory + userName + '/' + repositoryName} && sudo service nginx reload`, (error, stdout, stderr) => {
										let repositoryData = {
											repositoryName: repositoryName,
											userName: userName,
											path: repoPath,
											pathDocker: repoPath + '_docker',
											language: language
										}
										req.app.db.models.Repository.create(repositoryData, (err, result) => {
											if (err) {
												console.log("Error", err);
												return;
											}
											updateDigitalocean(repositoryName, (err, result) => {
												if (err) {
													console.log("Error", err);
													return;
												}
												else {
													res.json({ status: 'true', message: 'Repository created successfully' })
												}
											})
										});
									});
								});
							}
						});
					}
				})
		} catch (err) {
			if (err.code !== 'EEXIST')
				res.json({ status: 'false', message: 'Repository already exists please choose another name' })
			return;
		}
	}
	else {
		res.status(403).json("invalid Credentials")
	}
}


module.exports.deleteRepository = (req, res) => {
	if (req.JWTData) {

		let userName = req.JWTData.userName;
		let repositoryName = req.body.repositoryName;
		let id = req.params.id;

		req.app.db.models.Repository.findOneAndRemove({ _id: id }, (err, repositoryData) => {
			if (err) {
				console.log("Error", err);
				return;
			}
			execute(`rm -rf ${repositoryData.path} && rm -rf ${repositoryData.pathDocker} `, (result) => {
				console.log(result)
				res.json({ status: true, message: "Deleted" })
			})
			execute(`docker stop ${repositoryName}docker_web_1 && docker rm ${repositoryName}docker_web_1 && docker stop ${repositoryName}docker_web`, (result) => {
				console.log("Container deleted")
			})
		})
	}
	else {
		res.status(403).json("invalid Credentials")
	}
}

module.exports.getAllRepositories = (req, res) => {
	console.log(req.JWTData);
	if (req.JWTData) {
		req.app.db.models.Repository.find({ "userName": req.JWTData.userName }, (err, result) => {
			if (err) {
				console.log("Error", err);
				return;
			}
			res.status(200).json(result);
		})
	} else {
		res.status(403).json({ status: false, message: "Session timed out" })
	}
}


var execute = (command, callback) => {
	exec(command, (error, stdout, stderr) => {
		console.log("Error", error);
		console.log("Std err", stderr);
		console.log("Stdout", stdout);
		callback(stdout);
	});
};


var updateDigitalocean = (repositoryName, callback) => {
	makeRequestToDigitalOcean("POST", repositoryName, (err, body) => {
		if (err) {
			return callback(err, { status: false, message: "Error in digitalOcean" });
		}
		else {
			callback(null, { status: "success", message: "record created successfully" });
		}
	})
}

var makeRequestToDigitalOcean = (method, repositoryName, callback) => {
	let options = {};
	if (method == "GET") {
		options = {
			url: "https://api.digitalocean.com/v2/domains/tocstack.com/records",
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + token
			}
		}
	}
	else if (method == "POST") {
		options = {
			url: "https://api.digitalocean.com/v2/domains/tocstack.com/records",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + token
			},
			body: JSON.stringify(
				{
					"type": "A",
					"name": repositoryName,
					"data": "139.59.69.254",
					"priority": null,
					"port": null,
					"ttl": 1800,
					"weight": null,
					"flags": null,
					"tag": null
				})
		}
	}
	request(options, (error, response, body) => {
		if (error) {
			console.log("Error", error);
			return;
		}
		console.log("Response", body)
		callback(null, body)
	})
}
