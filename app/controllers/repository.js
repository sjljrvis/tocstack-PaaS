import fs,{ rmdirSync } from 'fs'
import { exec,execSync } from 'child_process';
import { rootDirectory } from '../helper/constant'
import { buildProjectGithub } from '../../scripts/github'
import { callDockerPath,shellScriptPath,token,NGINX_DIRECTORY,NGINX_SITES_ENABLED,serverRootDirectory } from '../../config'
import request from 'request'
import rmdir from 'rmdir'
import Git from 'nodegit'


export const createRepository = async (req,res) => {

	if (req.JWTData) {
		let userName = req.JWTData.userName;
		let userId = req.JWTData.id;
		let repositoryName = req.body.repositoryName;
		let language = req.body.language || "nodeJS";

		try {
			execSync(`cd && cd ${rootDirectory + userName} && sudo -u www-data mkdir ${repositoryName}`)
			let repository = await (req.app.db.models.Repository.findOne({ repositoryName: repositoryName }))
			if (repository) throw new Error('Repository already exists please choose another name')
			else {
				const repoPath = rootDirectory + userName + '/' + repositoryName;
				execSync('git init --bare ' + repoPath);
				fs.writeFileSync(repoPath + "/calldocker.js",fs.readFileSync(`${callDockerPath}/calldocker.js`));
				fs.writeFileSync(repoPath + "/hooks/post-receive",fs.readFileSync(`${shellScriptPath}/post-receive`));
				fs.writeFileSync(repoPath + "/hooks/pre-receive",fs.readFileSync(`${shellScriptPath}/pre-receive`));
				fs.writeFileSync(repoPath + "/containerName.txt",fs.readFileSync(`${shellScriptPath}/containerName.txt`));
				execSync(`chmod +x  ${repoPath + '/hooks/pre-receive'} && chmod +x  ${repoPath + '/hooks/post-receive'} && chown www-data:www-data -R ${rootDirectory + userName} && chown www-data:www-data -R ${rootDirectory + userName + '/' + repositoryName} && sudo service nginx reload`);
				let repositoryData = {
					repositoryName: repositoryName,
					userName: userName,
					userId: userId,
					path: repoPath,
					pathDocker: repoPath + '_docker',
					language: language
				}
				let result = await (req.app.db.models.Repository.create(repositoryData));
				res.json({ status: true,message: 'Repository created successfully' });
				updateDigitalocean(repositoryName,(err,result) => {
					if (err) log.error("DO error",err);
				});
			}
		} catch (err) {
			console.log(err)
			if (err.code !== 'EEXIST') res.json({ status: 'false',message: 'Repository already exists please choose another name' })
			else {
				res.json({ status: false,message: e.message })
			}
		}
	}
	else {
		res.status(403).json({ status: false,message: "invalid Credentials" })
	}
}
export const deleteRepository = async (req,res) => {
	try {
		if (!req.JWTData) throw new Error("Invalid Credentials");
		let userName = req.JWTData.userName;
		let repositoryName = req.body.repositoryName;
		let id = req.params.id;

		let repositoryData = await (req.app.db.models.Repository.findOneAndRemove({ _id: id }));
		exec(`rm -rf ${repositoryData.path} && rm -rf ${repositoryData.pathDocker} `,(err,stdout,stderr) => {
			res.json({ status: true,message: "Deleted" })
		})
		exec(`docker stop ${repositoryName}docker_web_1 && docker rm ${repositoryName}docker_web_1 && docker stop ${repositoryName}docker_web`,(err,stdout,stderr) => {
			log.info("Stopping running container");
		});
		exec(`rm ${NGINX_DIRECTORY}/${repositoryName}.tocstack.com && rm ${NGINX_SITES_ENABLED}/${repositoryName}.tocstack.com && sudo service nginx reload`,(err,stdout,stderr) => {
			log.info("Deleting Container");
		});
		deleteDigitalOcean(repositoryName,(err,body) => {
			if (err) log.info({ status: false,message: " Unable to delete record" })
			log.info(body)
		})
	} catch (e) {
		res.json({ status: 'false',message: e.message })
	}
}
export const unlinkAppFromGithub = async (req,res) => {
	let { repositoryName } = req.params;
	try {
		if (!req.JWTData) {
			throw new Error("Invalid user")
		} else {
			let _github = {
				connected: false,
				repositoryName: "",
				url: "",
			}
			let result = await (req.app.db.models.Repository.findOneAndUpdate({ repositoryName },{ github: _github },{ new: true }));
			if (result) {
				res.status(200).json({ status: true,repository: result });
			}
		}
	} catch (e) {
		res.json({ status: false,message: e.message })
	}
}
export const linkAppToGithub = async (req,res) => {
	let { repositoryName } = req.params;
	try {
		if (!req.JWTData) {
			throw new Error("Invalid user")
		} else {
			let _github = {
				connected: true,
				repositoryName: req.body.githubRepositoryName,
				url: req.body.githubRepositoryUrl,
			}
			let result = await (req.app.db.models.Repository.findOneAndUpdate({ repositoryName },{ github: _github },{ new: true }));
			if (result) {
				res.status(200).json({ status: true,repository: result });
			}
		}
	} catch (e) {
		console.log(e)
		res.json({ status: false,message: e.message })
	}
}
export const getAllRepositories = async (req,res) => {
	try {
		if (!req.JWTData) {
			throw new Error("Invalid user")
		} else {
			let result = await (req.app.db.models.Repository.find({ "userName": req.JWTData.userName }));
			if (result) {
				res.status(200).json({ status: true,repositories: result });
			}
		}
	} catch (e) {
		res.json({ status: false,message: e.message })
	}
}
export const getRepository = async (req,res) => {
	try {
		if (!req.JWTData) {
			throw new Error("Invalid user")
		} else {
			let result = await (req.app.db.models.Repository.findOne({ "repositoryName": req.params.repositoryName }));
			if (result) {
				res.status(200).json({ status: true,repository: result });
			}
		}
	} catch (e) {
		res.json({ status: false,message: e.message })
	}
}
export const buildGitHubRepository = async (req,res) => {
	try {
		if (!req.JWTData) {
			throw new Error("Invalid user")
		} else {
			let { userName } = req.JWTData;
			let repository = await (req.app.db.models.Repository.findOne({ "repositoryName": req.params.repositoryName }));
			if (repository) {
				let repositoryVerification = verifyRepositoryPath(repository,userName)
				console.log(repositoryVerification)

				switch (repositoryVerification.action) {

					case "clone":
						if (!repositoryVerification.oldRepo) {
							log.info("cloning repository .....",repository.github.url)
							fs.mkdirSync(`${repositoryVerification.basePath}/${repository.repositoryName}`)
							Git.Clone(repository.github.url,`${repositoryVerification.basePath}/${repository.repositoryName}`)
								.then((repo) => {
									log.info("cloning repository .....done")
									buildProjectGithub(req.params.repositoryName,repositoryVerification.newRepo,userName)
								}).catch((err) => {
									log.error(err)
								});
						}
						else {
							log.info("Cleaning directory....",)
							log.info("Cleaning directory....done",)
							log.info("cloning repository .....",repository.github.url)
							rmdir(`${repositoryVerification.basePath}`,(err) => {
								Git.Clone(repository.github.url,`${repositoryVerification.basePath}/${repository.repositoryName}`)
									.then((repo) => {
										log.info("cloning repository .....done")
										buildProjectGithub(req.params.repositoryName,repositoryVerification.newRepo,userName)
									}).catch((err) => {
										log.error(err)
									});
							});
						}
						break;


					case "pull":
						log.info("pulling latest commit .....",repository.github.url)
						log.info("Cleaning directory....",)
						log.info("Cleaning directory....done",)
						rmdir(`${repositoryVerification.basePath}`,(err) => {
							Git.Clone(repository.github.url,`${repositoryVerification.basePath}/${repository.repositoryName}`)
								.then((repo) => {
									log.info("pulling latest commit .....done",repo)
									buildProjectGithub(req.params.repositoryName,repositoryVerification.newRepo,userName)
								}).catch((err) => {
									log.error(err)
								});
						})

						break;

					default: log.info("Invalid action found .....")
				}
				res.status(200).json({ status: true,repository: repository,repositoryVerification });
			}
		}
	} catch (e) {
		console.log(e)
		res.json({ status: false,message: e.message })
	}
}
/*
* SHOULD BE IN PROPER FOLDER STRUCTURE
*/
// GITHUB helpers

const verifyRepositoryPath = (repository,userName) => {

	if (!fs.existsSync(`${serverRootDirectory}${userName}/${repository.repositoryName}_github`)) {
		fs.mkdirSync(`${serverRootDirectory}/${userName}/${repository.repositoryName}_github`)
	}
	try {
		let path = fs.readdirSync(`${serverRootDirectory}${userName}/${repository.repositoryName}_github`);
		path = path.filter(file => !file.startsWith('.'))
		return {
			basePath: `${serverRootDirectory}${userName}/${repository.repositoryName}_github`, // Change this path based on PROD_ENV !
			oldRepo: path[0] || null,
			newRepo: repository.github.repositoryName,
			action: path[0] ? "pull" : "clone"
		}
	} catch (e) {
		throw new Error("Repository not found,Build from github failed")
	}
}



let updateDigitalocean = (repositoryName,callback) => {
	makeRequestToDigitalOcean("POST",repositoryName,null,(err,body) => {
		if (err) {
			return callback(err,{ status: false,message: "Error in digitalOcean" });
		}
		else {
			callback(null,{ status: "success",message: "record created successfully" });
		}
	})
}

let deleteDigitalOcean = (repositoryName,callback) => {
	makeRequestToDigitalOcean("GET",repositoryName,null,(err,body) => {
		if (err) {
			return callback(err,{ status: false,message: "Error in digitalOcean" });
		}
		else {
			let domainRecords = JSON.parse(body).domain_records;
			let recordId = domainRecords.filter(x => x.name == repositoryName).map((x) => { return x.id })[0];
			makeRequestToDigitalOcean("DELETE",repositoryName,recordId,(err,body) => {
				if (err) {
					return callback(err,{ status: false,message: "Error in digitalOcean" });
				}
				else {
					return callback(null,{ status: true,message: "Deleted successfully" })
				}
			});
		}
	})
}


let makeRequestToDigitalOcean = (method,repositoryName,recordId,callback) => {
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
	else if (method == "DELETE") {
		options = {
			url: `https://api.digitalocean.com/v2/domains/tocstack.com/records/${recordId}`,
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + token
			},
		}
	}
	request(options,(error,response,body) => {
		if (error) {
			log.error("Error in Digital Ocean api",error);
			return;
		}
		callback(null,body)
	})
}
