import{decodeToken} from '../../middleware/decodeJWT'
export const loginRoute = (app) => {

    app.post('/login', require(__base + '/app/controllers/login').loginPage);
    app.get('/admin/permissions', require(__base + '/app/controllers/login').permissions);
    app.get('/logout',decodeToken,require(__base + '/app/controllers/login').logout);

    app.get('/auth/userDetails', function (req, res) {
        res.json({ message: "success" });
    });
    app.get('/auth/user', function (req, res) {
        res.json({ message: "success" });
    });

};

