// Login page
module.exports.loginPage = function (req, res, next) {

	req.app.db.models.User.findOne({
		email: req.body.email
	}, function (err, user) {
		if (err) {
			winston.log(err);
			return res.status(400).json({
				user: req.JWTData,
				firstName: '',
				email: '',
				message: 'Something went wrong',
				
			});
		}
		if (!user) {
			return res.status(200).json({
				status: 0,
				user: req.JWTData,
				firstName: '',
				email: '',
				message: 'Sorry, wrong email address or password',
			
			});
		}
		if (user.validPassword(req.body.password)) {
			var payload = {
				id: user._id,
				email: user.email,
				userName : user.userName,
			};
			console.log("payload" , payload)
			var token = req.app.jwt.sign(payload, req.app.config.jwtSecret);
			res.cookie('token', token);
			console.log('COOKIES', req.cookies);

			res.json({
				user: req.JWTData,
				userName: payload.userName,
				email: payload.email,
				message: 'Success',
				token : token
			});

		} else {
			return res.status(200).json({
				status: 0,
				user: req.JWTData,
				userName: '',
				email: '',
				message: 'Sorry, wrong email address or password',
			
			});
		}
	});
};


module.exports.permissions = function (req, res, next) {
    res.json({ message : req.JWTData.permissions})
};



module.exports.logout = function (req, res, next) {
    res.json({ message : "successful"})
};