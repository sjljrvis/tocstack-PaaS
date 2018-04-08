import { decodeToken } from '../../middleware/decodeJWT'
export const userRoute = (app) => {


	app.put('/admin/user',require(__base + '/app/controllers/users.js').addUser);
	app.post('/admin/user',require(__base + '/app/controllers/users.js').editUser);
	app.post('/admin/deleteuser/:userName',require(__base + '/app/controllers/users.js').deleteUser);
	app.post('/admin/generatetoken',decodeToken,require(__base + '/app/controllers/users.js').generates3Token);
	app.post('/admin/showtoken',decodeToken,require(__base + '/app/controllers/users.js').shows3Token);

};
