
module.exports.decodeToken = (req, res, next) => {
	
	console.log(req.get('Authorization'))

	var auth = req.get('Authorization')

	if(!req.get('Authorization')){
		res.json({ message : "You are not Authorized"});
		return;
	}

  var decoded = req.app.jwt.decode(auth);
	req.JWTData = decoded;
	console.log('########################DECODED########################');
	console.log(req.JWTData);
	next(); 
};