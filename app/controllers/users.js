import fs from 'fs';
import crypto from 'crypto';
import md5 from 'apache-md5';
import { exec } from 'child_process';
import { rootDirectory } from '../helper/constant';
import { execshell } from '../helper/functions';
import { hashSecret } from '../../config';

const cipher = crypto.createCipher('aes192',hashSecret);

/* delete user & add-user had status key of type string 
*  do check it before testing with frontend integration
*/

export const deleteUser = async (req,res) => {
	try {
		let user = await (req.app.db.models.User.findOneAndRemove({ userName: req.params.userName }));
		exec(`rm -rf ${rootDirectory + user.userName}`,(err,stdout,stderr) => {
			if (err) throw new Error(err);
			else {
				res.status(200).json({ status: true,message: "success" });
			}
		})
	} catch (e) {
		return res.json({ status: false,message: e.message })
	}
};


export const addUser = async (req,res) => {
	let user = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: req.body.password,
		userName: req.body.userName,
		email: req.body.email,
	};
	try {
		if (!req.body.password || !req.body.email) throw new Error("Fields can not be empty");
		let data = await (req.app.db.models.User.findOne({
			$or: [
				{ email: req.body.email },
				{ userName: req.body.userName }
			]
		}));
		if (data) throw new Error("Duplicate Email Address");
		data = await (req.app.db.models.User.create(user));
		exec(`sudo -u www-data mkdir ${rootDirectory + data.userName} && chown www-data:www-data -R ${rootDirectory + data.userName}`,(err,stdout,stderr) => {
			if (err) throw new Error(err);
			else {
				let passwordData = `${req.body.userName}:${md5(req.body.password)}`;
				fs.writeFile(`${rootDirectory + data.userName}/htpasswd`,passwordData,(err) => {
					if (err) throw new Error(err);
					else {
						exec(`sudo service nginx reload`,(err,stdout,stderr) => {
							if (err) throw new Error(err);
							res.json({ status: true,message: "Register successful" });
						});
					};
				});
			};
		});
	}
	catch (e) {
		return res.json({ status: false,message: e.message })
	}
};


module.exports.editUser = (req,res) => {

	var user = {
		$set: {
			password: "",
			confirmPassword: "",
			s3Token: ""
		}
	};
	if (req.body.password) {
		req.app.db.models.User.findOne({ userName: req.body.userName },(err,userData) => {
			if (err) {
				res.json({ "message": "error" });
				return;
			}
			else {
				if (userData.validPassword(req.body.oldPassword)) {
					var SALT_FACTOR = 5;
					req.app.bcrypt.genSalt(SALT_FACTOR,(err,salt) => {
						if (err) {
							res.json({ "message": "error" });
							return
						}
						req.app.bcrypt.hash(req.body.password,salt,(err,hash) => {
							if (err) {
								res.json({ "message": "error" });
								return
							}
							let encrypted = cipher.update(JSON.stringify({ userName: user.userName + Date.now() }),'utf8','hex');
							encrypted += cipher.final('hex');
							console.log(encrypted);
							userData.s3Token = encrypted;
							userData.password = hash;
							userData.confirmPassword = hash;
							userData.save();
							res.json({ status: true,message: "Password updated" });
						});
					});
					let passwordData = `${req.body.userName}:${md5(req.body.password)}`
					fs.writeFile(`${rootDirectory + req.body.userName}/htpasswd`,passwordData,(data) => {
						if (err) {
							return;
						}
						else {
							execshell(` sudo chown www-data ${rootDirectory + req.body.userName}/htpasswd && sudo service nginx reload`,(err,stdout) => {
								if (err) {
									return;
								}
								else {
									console.log({ status: true,message: "Password file updated" })
								}
							})
						}
					})
				}
				else {
					res.json({ status: false,"message": "Old password is incorrect" });
				}
			}
		});
	}
};


module.exports.generates3Token = (req,res) => {
	req.app.db.models.User.findOne({ email: req.JWTData.email },(err,user) => {
		if (user) {
			try {
				let encrypted = '';
				cipher.on('readable',() => {
					const data = cipher.read();
					if (data) {
						encrypted = data.toString('hex');
						user.s3Token = encrypted;
						user.save();
					}
				});
				console.log({ userName: user.userName + Date.now() })
				cipher.write(JSON.stringify({ userName: user.userName + Date.now() }))
				res.status(200).json({ status: true,"message": "Generated token successfully","s3Token": encrypted });
			}
			catch (execption) {
				return res.status(200).json({ status: false,"message": "Sorry ! Could generate Token , Please try after some time" });
			}
		}
		else {
			return res.status(200).json({ status: false,"message": "Invalid user" });
		}
	});
}


module.exports.shows3Token = (req,res) => {
	req.app.db.models.User.findOne({ email: req.JWTData.email },(err,user) => {
		if (err) {
			return res.status(200).json({ status: false,"message": "Error occured Please try again","s3Token": "" });
		}
		if (user) {
			return res.status(200).json({ status: true,"message": "Generated token successfully","s3Token": user.s3Token });
		}
		else {
			return res.status(200).json({ status: false,"message": "Invalid user" });
		}
	});
}