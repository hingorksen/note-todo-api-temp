const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'first test todo'
}, {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', ()=>{
    it('should create a new todo', (done) =>{
        var text = 'test todo text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                done(err);
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create todo with invalid body data', done =>{
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });

    });

});

describe ('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);

    });
});

describe('GET /todos:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);

    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ID', (done) => {
        var id = 123;
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);

    });

});

describe('DELETE /todos/:id', ()=>{
    it('should remove a todo', (done) =>{
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });


    });

    it('should return 404 if todo not found', (done) =>{
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return if objectID is invalid', (done) =>{
        var id = 123;
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', ()=>{
    it('should update the todo', (done) => {
        var newText = 'todo patch test';
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .send({
                text: newText,
                completed: true})
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo.text).toBe(newText);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            }).end(done);


    });

    it('should clear completedAt when todo is not completed', (done) =>{

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send({
                text: "testing -> new second"
            })
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo.completedAt).toBe(null);
            }).end(done);
    });


});
