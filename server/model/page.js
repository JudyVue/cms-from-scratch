'use strict';

const uuid = require('uuid');
const firebase = require('firebase');
const createError = require('http-errors');

const Page = module.exports = function(opts){
  this.id = opts.id || uuid.v1();

  //required props
  this.title = opts.title;
  this.content = opts.content;
  this.showInNav = opts.showInNav;
};


//ref in firebase = a mongo collection
//childin firebase = a mongo doc
Page.fetchAll = function(){
  return firebase.database().ref('/pages').once('value')
  .then(snapShot => {
    let data = snapShot.val(); //comes back as object

    ///make into array
    let pages = Object.keys(data).map(key => data[key]);
    return pages;
  });
};


Page.findByIDAndDelete = function(id){
  return firebase.database().ref('/pages')
  .child(id).remove()
  .then(() => firebase.auth().signOut())
  .catch(err => {
    firebase.auth().signOut();
    throw err;
  });
};

//instance methods
Page.prototype.validate = function(){
  if(!this.title || !this.content || !this.showInNav)
    return Promise.reject(createError(400, 'missing required property'));
  return Promise.resolve();
};

Page.prototype.save = function(){
  return this.validate()
  .then(() => {
    return firebase.database().ref('/pages')
    .child(this.id).set(this);
  })
  .then(() => {
    return firebase.auth().signOut();
  })
  .then(() => this)
  .catch(err => {
    firebase.auth().signOut();
    throw err;
  });
};
