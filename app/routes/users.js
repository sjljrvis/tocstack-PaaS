import { decodeToken } from '../../middleware/decodeJWT'
import { getUserInfo,addUser,editUser,deleteUser,generates3Token,shows3Token } from '../controllers/users'
export const userRoute = (app) => {

	app.get('/user/:userName',getUserInfo)
	app.put('/admin/user',addUser);
	app.post('/admin/user',editUser);
	app.post('/admin/deleteuser/:userName',deleteUser);
	app.post('/admin/generatetoken',decodeToken,generates3Token);
	app.post('/admin/showtoken',decodeToken,shows3Token);

};
