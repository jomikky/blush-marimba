/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    
     MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {};
        db.collection("library").find(query, {_id: 1, title: 1, comments: 1}).toArray(function(err, doc) {
          if (err) res.json({"message": "Error occurred while finding", "error": err});
          if(doc !== null && doc !== undefined && doc.length > 0){
            for(var i=0;i<doc.length;i++) {
              doc[i].commentcount = doc[i].comments.length;
              delete doc[i].comments;
            }
            res.json(doc);
          }else{
            res.send( 'no book exists' );
          }
          db.close();
        });
      });
    
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){
        res.send('Please insert a Title');
      } else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) res.json({"message": "db connection error", "error": err});

          var query = { title: title, comments: [] };
          db.collection("library").insertOne(query, function(err, doc) {
            if (err) res.json({"message": "Error occurred while inserting", "error": err});
            res.json(doc.ops[0]);
            db.close();
          });
        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    
       MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {};
        db.collection("library").deleteMany(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while deleting", "error": err});
          console.log(doc);
          res.send( 'complete delete successful' );
          db.close();
        });
      });
    });

  
  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
        db.collection("library").findOne(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while finding", "error": err});
          
          if(doc !== null && doc !== undefined){
            //console.log(doc);
            res.json(doc);
          }else{
            res.send('no book exists');
          }
          
          db.close();
        });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      if(!comment){
        res.json({"error": "comment is empty!"});
      }else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) res.json({"message": "db connection error", "error": err});

          var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
          //var query = {"_id" : new ObjectId(bookid)};
          db.collection("library").findOneAndUpdate(query, { $push: {comments: comment } }, function(err, doc) {
            if (err) res.json({"message": "Error occurred while finding", "error": err});

            if(doc !== null && doc !== undefined){
              doc.value.comments.push(comment);
              console.log(doc.value);
              res.json(doc.value);
            }else{
              res.json({"message": "could not found or update", "_id": bookid});
            }

            db.close();
          });

        });
      }
    
    
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
        db.collection("library").deleteOne(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while deleting", "error": err});
          console.log(doc);
          //res.json({"message": "delete successful", "_id": bookid});
          res.send( 'delete successful' );
          db.close();
        });
      });
    });
  
};
