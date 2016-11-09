'use strict';

const config = require('./config');

const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const expressNunjucks = require('express-nunjucks');
const compression = require('compression');
const logger = require('morgan');
const session = require('express-session');
const redis = require('redis');
const redisCrypto = require('connect-redis-crypto');
const flash = require( 'connect-flash' );
const url = require('url');

const companyController = require('./app/controller/companycontroller');
const contactController = require('./app/controller/contactcontroller');
const interactionController = require('./app/controller/interactioncontroller');
const searchController = require('./app/controller/searchcontroller');
const apiController = require('./app/controller/apicontroller');
const leadsController = require('./app/controller/leadscontroller');
const loginController = require('./app/controller/logincontroller');

const customValidators = require('./app/lib/validators');
const customSanitizers = require('./app/lib/sanitizers');
const filters = require('./app/lib/nunjuckfilters');
const auth = require( './app/middleware/auth');
let metadata = require( './app/lib/metadata' );

const app = express();
const isDev = app.get('env') === 'development';

let RedisStore = redisCrypto(session);

let client;

if (config.redis.url) {
  var redisURL = url.parse(config.redis.url);
  /* eslint-disable camelcase */
  client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  /* eslint-enable camelcase */
  client.auth(redisURL.auth.split(':')[1]);
} else {
  client = redis.createClient(config.redis.port, config.redis.host);
}

client.on('error', function clientErrorHandler(e) {
  console.error('Error connecting to redis');
  console.error(e);
  throw e;
});

client.on('connect', function() {
  console.log('connected to redis');
});

client.on('ready', function() {
  console.log('connection to redis is ready to use');
});

let redisStore = new RedisStore({
  client: client,
  // config ttl defined in milliseconds
  ttl: config.session.ttl / 1000,
  secret: config.session.secret
});

app.use(session({
  store: redisStore,
  proxy: (isDev ? false : true ),
  cookie: {
    secure: (isDev ? false : true ),
    maxAge: config.session.ttl
  },
  rolling: true,
  key: 'datahub.sid',
  secret: config.session.secret,
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(expressValidator({ customValidators, customSanitizers }));

app.use(compression());
app.set('views', [
  `${__dirname}/app/views`,
  `${__dirname}/node_modules/govuk_template_jinja/views`
]);


filters.stringify = JSON.stringify;

expressNunjucks(app, {
  watch: isDev,
  noCache: isDev,
  filters: filters
});


// Insert useful variables into response for all controllers
app.use(require(`${__dirname}/app/middleware/locals`));

// Static files
app.use('/images', express.static(`${__dirname}/node_modules/govuk_frontend_toolkit/images`));
app.use('/fonts', express.static(`${__dirname}/node_modules/govuk_template_mustache/assets/stylesheets`));
app.use('/fonts', express.static(`${__dirname}/node_modules/font-awesome/fonts`));
app.use('/javascripts/react', express.static(`${__dirname}/node_modules/react/dist`));
app.use('/javascripts/react-dom', express.static(`${__dirname}/node_modules/react-dom/dist`));
app.use(express.static(`${__dirname}/app/public`));
app.use(express.static(`${__dirname}/build`));
app.use(express.static(`${__dirname}/node_modules/govuk_template_jinja/assets`));

app.use( logger( ( isDev ? 'dev' : 'combined' ) ) );

app.use(function(req, res, next){

  const formErrors = req.flash( 'error' );

  res.locals.messages = {
    success: req.flash('success-message'),
    error: req.flash('error-message')
  };

  if( formErrors && formErrors.length ){

    res.locals.messages.formErrors = formErrors;
  }

  next();
});

app.use(auth);
app.use('/login', loginController.router);
app.use('/company', companyController.router);
app.use('/contact', contactController.router);
app.use('/interaction', interactionController.router);
app.use('/search', searchController.router);
app.use('/leads', leadsController.router);
app.use('/api', apiController.router);

app.get('/', function(req, res) {
  res.render('index');
});

metadata.fetchAll( ( errors ) => {

  if( errors ){

    console.log( 'Unable to load all metadata, cannot start app' );

    for( let err of errors ){
      throw err;
    }

  } else {

    app.listen(config.port, function(){
      console.log('app listening on port %s', config.port);
    });
  }
} );
