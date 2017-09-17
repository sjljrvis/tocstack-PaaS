import {UserSchema} from './schema/users';
import {RepositorySchema} from './schema/repositories';


export const models = (app, mongoose) => {
  UserSchema(app, mongoose);
  RepositorySchema(app, mongoose);
  
}