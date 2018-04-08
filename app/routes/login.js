import { decodeToken } from '../../middleware/decodeJWT'
import { loginPage, logout, permissions } from '../controllers/login'
export const loginRoute = (app) => {

    app.post('/login', loginPage);
    app.get('/logout', decodeToken, logout);
    app.get('/admin/permissions', permissions);
    
    app.get('/auth/userDetails', (req, res) => {
        res.json({ message: "success" });
    });
    app.get('/auth/user', (req, res) => {
        res.json({ message: "success" });
    });
};

