require('babel-core/register');
require('babel-polyfill');

let chai = require('chai');
let chaiHttp = require('chai-http');

// let server = require('../app/routes/users');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Books',() => {
  beforeEach((done) => { //Before each test we empty the database
    Book.remove({},(err) => {
      done();
    });
  })
})