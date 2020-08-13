/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const { body, validationResult } = require("express-validator");
const mongo = require("mongodb").MongoClient;

module.exports = function(app, db) {
  app
    .route("/api/books")
    .get(function(req, res) {
      db.collection("books")
        .find({}, { limit: 1000 })
        .toArray((err, bookArray) => {
          if (err) throw err;
          res.status(200).json(bookArray);
        });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post([body("title").notEmpty()], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const title = req.body.title;
      db.collection("books").insertOne({ title , comments: [], commentcount: 0}, (err, result) => {
        if (err) throw err;
        console.log(result.ops[0]);
        res.json(result.ops[0]);
      });
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      db.collection('books').drop((err, result) => {
        if (err) throw err;
        return res.status(200).json('complete delete successful');
      })
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var _id = req.params.id;
    
      if (!ObjectId.isValid(_id)) {
        return res.json("Invalid _id");
      }
      
      db.collection('books').findOne({_id: ObjectId(_id)}, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.json(result);
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post([body('comment').notEmpty()], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      var _id = req.params.id;
      
      if (!ObjectId.isValid(_id)) {
        return res.json("Invalid _id");
      }
      
      var comment = req.body.comment;
    
      db.collection('books').findOneAndUpdate({_id: ObjectId(_id)}, {
        $push: {comments: comment},
        $inc: {commentcount: 1}
      }, {returnOriginal: false}, (err, result) => {
        if (err) throw err;
        res.status(200).json(result.value);
      })
      //json res format same as .get
    })

    .delete(function(req, res) {
      var _id = req.params.id;
      
      if (!ObjectId.isValid(_id)) {
        return res.json("Invalid _id");
      }
      
      db.collection('books').deleteOne({_id: ObjectId(_id)}, (err, result) => {
        if (err) throw err;
        res.status(200).json('delete successful');
      })
      //if successful response will be 'delete successful'
    });
};
