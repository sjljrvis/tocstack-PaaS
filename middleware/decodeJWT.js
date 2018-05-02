
module.exports.decodeToken = (req,res,next) => {
	if (!req.get('Authorization')) {
		log.error(new Error("Authorization header not found"));
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
			next();
		}
	}
};
