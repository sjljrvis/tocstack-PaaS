export const loginRoute = (app) => {

    app.post('/login', require(__base + '/app/controllers/login').loginPage);
    app.get('/admin/permissions', require(__base + '/app/controllers/login').permissions);
    app.get('/admin/logout', require(__base + '/app/controllers/login').logout);

};

