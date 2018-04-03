import { jwtSecret } from '../../config'

export const loginPage = async(req, res) => {
	try {
		if (req.body.email && req.body.password) {
			let user = await (req.app.db.models.User.findOne({ email: req.body.email }))
			if (user == null) {
				throw new Error("User with this email-id does not exist")
			}
			else {
				if (user.validPassword(req.body.password)) {
					let payload = {
						id: user._id,
						email: user.email,
						userName: user.userName,
					}
					let token = req.app.jwt.sign(payload,jwtSecret);
					res.status(200).json({
						status: true,
						// user: req.JWTData,
						userName: payload.userName,
						email: payload.email,
						message: 'Success',
						token: token
					});
				}
				else throw new Error("Email and password required")
			}
		}
		else throw new Error("Email and password is wrong")
	}
	catch (e) {
		return res.status(200).json({ status: false, messsage: e.message })
	}
}


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




