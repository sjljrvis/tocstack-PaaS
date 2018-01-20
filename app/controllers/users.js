const fs = require('fs')
var exec = require('child_process').exec;
import md5 from 'apache-md5'
import { rootDirectory } from '../helper/constant'
import { execshell } from '../helper/functions'

module.exports.viewAllUsers = (req, res) => {
	req.query.search = req.query.search ? req.query.search : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
	req.query.sort = req.query.sort ? req.query.sort : '_id';
	req.query.page = req.query.page ? parseInt(req.query.page) : 1;
	var filters = {};
	var keys = "firstName email lastName permissions";
	req.app.db.models.User.pagedFind({
		filters: filters,
		keys: keys,
		limit: req.query.limit,
		page: req.query.page,
		sort: req.query.sort
	}, function (err, results) {
		if (err) {
			res.json({ message: "error" });
			return;
		}
		console.log(results);
		res.json(results);
	});
};

module.exports.viewUser = (req, res) => {
	req.app.db.models.User.findById(req.params.id, function (err, user) {
		if (err) {
			console.log("Error", err);
			res.json({ message: "error" });
			return
		}
		res.json(user);
	});
};


module.exports.deleteUser = (req, res) => {
	req.app.db.models.User.findOneAndRemove({ userName: req.params.userName }, function (err, user) {
		if (err) {
			console.log("Error", err);
			res.status(200).json({ status: "false", message: "error" });
			return
		}
		exec(`rm -rf ${rootDirectory + user.userName}`, (error, stdout, stderr) => {
			console.log(`rm -rf ${rootDirectory}+${user.userName}`);
			if (error !== null) {
				res.status(200).json({ status: "false", message: "error" });
				return;
			}
			else {
				res.status(200).json({ status: "true", "message": "success" });
			}
		})
	});
};


module.exports.addUser = (req, res) => {
	var user = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: req.body.password,
		userName: req.body.userName,
		email: req.body.email,
	};
	if (!req.body.password || !req.body.email) {
		res.json({ "message": "error" });
		return
	}
	req.app.db.models.User.findOne({
		$or: [
			{ email: req.body.email },
			{ userName: req.body.userName }
		]
	},
		function (err, data) {
			if (err) {
				console.log("Error", err);
				res.json(err);
				return
			}
			if (data) {
				res.json({
					"status": "false",
					"message": "Duplicate Email Address"
				});
				return
			}
			req.app.db.models.User.create(user, (err, data) => {
				if (err) {
					console.log("Error", err);
					res.json(err);
					return
				}
				execshell(`sudo -u www-data mkdir ${rootDirectory + data.userName} && chown www-data:www-data -R ${rootDirectory + data.userName}`, (err, stdout) => {
					if (err) {
						return;
					}
					else {
						let passwordData = `${req.body.userName}:${md5(req.body.password)}`
						fs.writeFile(`${rootDirectory + data.userName}/htpasswd`, passwordData, (data) => {
							if (err) {
								return;
							}
							else {
								execshell(`sudo service nginx reload`, (err, stdout) => {
									if (err) {
										return;
									}
									else {
										res.json({ status: "true", message: "Register successful" });
									}
								})
							}
						})
					}
				})
			})
		});
};

module.exports.editUser = (req, res) => {

	var user = {
		$set: {
			password: "",
			confirmPassword: ""
		}
	};
	if (req.body.password) {

		req.app.db.models.User.findOne({ userName: req.body.userName }, (err, userData) => {
			if (err) {
				res.json({ "message": "error" });
				return;
			}
			else {
				if (userData.validPassword(req.body.oldPassword)) {
					var SALT_FACTOR = 5;
					req.app.bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
						if (err) {
							res.json({ "message": "error" });
							return
						}
						req.app.bcrypt.hash(req.body.password, salt, (err, hash) => {
							if (err) {
								res.json({ "message": "error" });
								return
							}
							user.$set.password = hash;
							user.$set.confirmPassword = hash;
							req.app.db.models.User.findByIdAndUpdate(userData._id, user, (err, data) => {
								if (err) {
									console.log("Error", err);
									return;
								}
								res.json({status: true, message: "Password updated"});
							});
						});
					});

					let passwordData = `${req.body.userName}:${md5(req.body.password)}`
					fs.writeFile(`${rootDirectory + req.body.userName}/htpasswd`, passwordData, (data) => {
						if (err) {
							return;
						}
						else {
							execshell(` sudo chown www-data ${rootDirectory+req.body.userName}/htpasswd && sudo service nginx reload`, (err, stdout) => {
								if (err) {
									return;
								}
								else {
									console.log({ status: true, message: "Password file updated" })
								}
							})
						}
					})
				}
				else {
					res.json({ status: false, "message": "Old password is incorrect" });
				}
			}
		});
	}
};
