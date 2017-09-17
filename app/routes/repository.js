export const repositoryRoute = (app) => {

 app.post('/createrepository' , require(__base+'/middleware/decodeJWT.js').decodeToken ,require(__base+"/app/controllers/repository").createRepository)
 app.post('/deleterepository/:id' , require(__base+'/middleware/decodeJWT.js').decodeToken ,require(__base+"/app/controllers/repository").deleteRepository)
 app.get('/repositories' , require(__base+'/middleware/decodeJWT.js').decodeToken , require(__base+"/app/controllers/repository").getAllRepositories)
 
}