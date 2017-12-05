// Login page
module.exports.loginPage = function (req, res, next) {
	req.app.db.models.User.findOne({
		email: req.body.email
	}, function (err, user) {
		if (err) {
			return res.status(400).json({ message: 'Please check all fields' });
		}
		if (user == null) {
			res.status(401).json({ message: 'User does not exist.' });
		}
		else {
			if (user.validPassword(req.body.password)) {
				var payload = {
					id: user._id,
					email: user.email,
					userName: user.userName,
				};
				var token = req.app.jwt.sign(payload, req.app.config.jwtSecret);
				res.cookie('token', token);
				res.json({
					user: req.JWTData,
					userName: payload.userName,
					email: payload.email,
					message: 'Success',
					token: token
				});
			} else {
				res.status(401).json({ message: 'Email or password is wrong.' });
			}
		}
	});
};

module.exports.logout = function (req, res, next) {
	if (req && req.JWTData) {
		req.app.db.models.User.findOne({ _id: req.JWTData.id }, (err, user) => {
			if (err) {
				return res.status(400).json({ message: 'Please check all fields' });
			}
			else if (user == null) {
				return res.status(401).json({ message: 'User does not exist.' });
			}
			else {
				return res.status(200).json({ message: 'Logged out' });
			}
		})
	} else {
		return res.status(400).json({ message: 'Please check all fields' });
	}
};

module.exports.permissions = function (req, res, next) {
	res.json({ message: req.JWTData.permissions })
};

