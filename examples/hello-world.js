// require Server class
var Server = require('..');

// create app instance and chain all stuff together,
// as you can see, express-scaffold injects models and ctrlers into
// app instance, it is a convenience way to organize all resource and modules
// which almost every route needs.
new Server({
  name: 'myApp',
  publics: './public',
  uploads: './uploads',
  // database: 'mongodb://localhost:27017/appdb',
  database: {
    name: 'appdb'
  }
})
// init models
// express-scaffold using `mongoose` to abstract data-models
// the object returned will be injected to `ctrlers` and `routes` functions
.models(function(db, Schema) {
  var userModel = new Schema({
    name: String,
    created: Date,
  });
  return {
    user: db.model('user', userModel)
  }
})
// init ctrlers
// express-scaffold will wrap all models into baseCtrler,
// which provides normal CRUS shortcuts function, e.g: 
// var user = new Ctrler(model.user);
// user.create()
// user.findById()
.ctrlers(function(models, Ctrler) {
  return {
    user: new Ctrler(models.user)
  }
})
// finally, we're going to make all route work,
// `routes` function contains all routes your app will invoke.
.routes(function(app, ctrlers, express, debug) {
  // use new Router function in Express 4.x
  var Home = express.Router();
  Home.get('/', function(req, res, next){
    // debug output will not show unless DEBUG mode is on.
    // e.g:
    // $ DEBUG=My very first App:* node app.js
    debug('home')('It works');
    res.send('It works');
  });
  app.use('/', Home);
  // use app[Verb]
  app.get('/hello', function(req ,res, next){
    res.send('hi');
  });
  // find all users in database and return.
  app.get('/users', function(req, res, next){
    // using `user` ctrler we made before to find all users,
    // and response with JSON string.
    ctrlers.user.find({}, function(err, users) {
      if (err) return next(err);
      debug('users')(users);
      res.json(users);
    });
  });
  // throw a fake error
  app.get('/errors', function(req, res, next){
    debug(500)(new Error('I am a fake error'));
    next(new Error('I am a fake error'));
  });
  // fake 404
  // new Error(404) is a custome error which redirect user to a 404 page.
  app.get('/404', function(req, res, next){
    next(new Error(404));
  });
})
.listen();