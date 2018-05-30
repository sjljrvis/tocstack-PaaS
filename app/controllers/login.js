import { jwtSecret } from '../../config'

export const loginPage = async (req,res) => {
	console.log("I m here")
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
		return res.status(200).json({ status: false,message: e.message })
	}
}



export const logout = async (req,res) => {
	try {
		let user = await req.app.db.models.User.findOne({ _id: req.JWTData.id });
		if (user == null) {
			throw new Error("User with this email-id does not exist")
		}
		else {
			return res.status(200).json({ message: 'Logged out' });
		}
	} catch (e) {
		return res.status(200).json({ status: false,message: e.message })
	}
}

export const permissions = (req,res) => {
	res.json({ message: req.JWTData.permissions })
};




