export const userRoute = (app) => {

  app.get('/admin/user', require(__base + '/app/controllers/users.js').viewAllUsers);
  app.get('/admin/user/:id', require(__base + '/app/controllers/users.js').viewUser);
  app.put('/admin/user', require(__base + '/app/controllers/users.js').addUser);
  app.post('/admin/user',  require(__base + '/app/controllers/users.js').editUser);
  app.post('/admin/deleteuser/:id',require(__base + '/app/controllers/users.js').deleteUser);

};
