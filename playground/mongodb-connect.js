const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err){
        return console.log("unable to connect mongodb server!");
    }
    console.log('connected to mongodb server!');

    db.collection('Todos').insertOne({
        text: 'something to do',
        completed: false
    },(err, result) => {
        if(err){
            return console.log('unable to insert todo', err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.close();
});
