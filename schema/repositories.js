'use strict';

export const RepositorySchema = function (app, mongoose) {
	var RepositorySchema = new mongoose.Schema({

		repositoryName: String,
		userName: String,
		language: {
			type: String,
			default: 'nodeJS'
		},
		containerName: {
			type: String,
			default: 'kracken'
		},
		path: String,
		pathDocker: String,
		date: {
			type: Date,
			default: Date.now()
		},
		isDeployed: { type: Boolean, default: false }

	});

	RepositorySchema.plugin(require('./plugins/pagedFind'));
	app.db.model('Repository', RepositorySchema);

};