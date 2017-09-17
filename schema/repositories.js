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

  });

  RepositorySchema.plugin(require('./plugins/pagedFind'));
  // RepositorySchema.index({
  //   _id: 1
  // });
//  RepositorySchema.set('autoIndex', (app.get('env') === 'development'));



  app.db.model('Repository', RepositorySchema);

};