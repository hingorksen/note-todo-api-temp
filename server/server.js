const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req,res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((data)=>{
        res.send(data);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req,res) => {
    Todo.find().then( (todos)=> {
        res.send({todos});
    }, (e) => {
        res.status(400)
    });
});

// GET /todos/41231234

app.get('/todos/:id', (req,res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
         return res.status(404).send('invalid id');
    }
    Todo.findById(req.params.id).then( (todo)=> {
        if(!todo){
            return res.status(404).send('todo not found!');
        }
        res.send({todo});
    }, (e) => {
        res.status(400);
    });
});

app.delete('/todos/:id', (req,res) => {
    //get id
    var id = req.params.id;

    //validate it or return 404
    if(!ObjectID.isValid(id)){
         return res.status(404).send('invalid id');
    }
    Todo.findByIdAndRemove(id).then((todo) => {
         if(!todo){
             return res.status(404).send();
         }
         res.send({todo});
     }).catch((e) => {
         res.status(400);
     });
    //remove todo by id
    //success
        //if no doc, send 404
        //send doc back with 200
    //error -> empty body and 400
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    //sub set of body. (the part we allowed to change)
    var body = _.pick(req.body, ['text', 'completed']);

    if(!ObjectID.isValid(id)){
         return res.status(404).send('invalid id');
    }

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e)=>{
        res.status(400).send();
    })


});

app.listen(port, ()=> {
    console.log(`Started up at port:${port}`);
});

module.exports = {app};
