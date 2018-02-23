'use strict';


export const UserSchema = function (app, mongoose) {
	var UserSchema = new mongoose.Schema({
		userName: String,
		email: { type: String, unique: true },
		password: { type: String },
		confirmPassword: { type: String },
		phoneNumber: String,
		firstName: String,
		lastName: String,
		date: {
			type: Date,
			default: Date.now()
		},

		s3Token: { type: String, default: "" }
	});

	UserSchema.plugin(require('./plugins/pagedFind'));
	UserSchema.index({
		username: 1
	});
	UserSchema.set('autoIndex', (app.get('env') === 'development'));

	UserSchema.methods.validPassword = function (password) {
		return app.bcrypt.compareSync(password, this.password);
	};

	UserSchema.pre('save', function (next) {
		console.log('presave');
		var user = this;
		var SALT_FACTOR = 5;

		if (!user.isModified('password')) return next();
		app.bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
			if (err) {
				return next(err);
			}
			console.log('presave1');
			app.bcrypt.hash(user.password, salt, function (err, hash) {
				console.log('presave2');
				if (err) {
					return next(err);
				}
				else {

					user.password = hash;
					next();
				}
			});
		});


	});

	app.db.model('User', UserSchema);

};