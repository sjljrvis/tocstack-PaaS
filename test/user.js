require('babel-core/register');
require('babel-polyfill');

let chai = require('chai');
let chaiHttp = require('chai-http');

let should = chai.should();

chai.use(chaiHttp);
//Our parent block
var assert = require('assert');
describe('/GET book',() => {
  it('it should GET all the books',(done) => {
    chai.request('http://localhost:5555')
      .get('/auth/user')
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        done();
      });
  });
});