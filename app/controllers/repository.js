const fs = require('fs')
var exec = require('child_process').exec;
import { execshell } from '../helper/functions'
import { rootDirectory } from '../helper/constant'
import { callDockerPath, shellScriptPath } from '../../config'
module.exports.createRepository = (req, res) => {

	if (req.JWTData) {
		let userName = req.JWTData.userName;
		var repositoryName = req.body.repositoryName;
		var language = req.body.language;

		try {
			execshell(`cd && cd ${rootDirectory + userName} && sudo -u www-data mkdir ${repositoryName}`,
				(err, stdout) => {
					if (err) {
						return res.status(200).json({ status: 'false', message: 'Repository already exists please choose another name' });
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
									res.json({ status: 'true', message: 'Repository created successfully' })
								})
							})
						})
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
			execute('rm -rf ' + repositoryData.path, (result) => {
				console.log(result)
				res.json("Deleted")
			})
			if (repositoryData.containerName != 'kracken') {
				execute('docker stop ' + repositoryData.containerName, (result) => {
					execute('docker rm ' + repositoryData.containerName, (result) => {
						execute('docker rmi ' + repositoryData.containerName, (result) => {
							condole.log("Container deleted")
						})
					})
				})
			}

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