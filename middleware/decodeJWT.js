
module.exports.decodeToken = (req, res, next) => {
	console.log(req.headers)
	if (!req.get('Authorization')) {
		console.log("error")
		res.status(401).json({ message: "You are not Authorized" });
		return;
	}
	else {
		var auth = req.get('Authorization');
		auth = auth.split(" ")[1];
		if (auth == '0') {
			var auth = req.get('Authorization');
			auth = auth.split(" ")[1]
			return res.status(401).json({ message: "You are not Authorized" });
		}
		else {
			var decoded = req.app.jwt.decode(auth);
			req.JWTData = decoded;
			console.log(decoded)
			next();
		}
	}
};