process.env.TZ = 'Asia/Kolkata';
require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const pgSession      = require('connect-pg-simple')(session);
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const morgan         = require('morgan');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

const { PORT, SESSION_SECRET, NODE_ENV } = require('./config/constants');

const pool           = require('./config/db');
const flashLocals    = require('./middlewares/flashLocals');
const errorHandler   = require('./middlewares/errorHandler');
const registerRoutes = require('./routes');

const app = express();


// ───────────── Trust Proxy (Required for Railway) ─────────────
app.set('trust proxy', 1);


// ───────────── Security ─────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
}));


// ───────────── Database Setup ─────────────
if (NODE_ENV === 'production') {
  require('./config/setupDb');
}


// ───────────── Logging ─────────────
// if (NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('tiny'));
// }


// ───────────── View Engine ─────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


// ───────────── Static Files ─────────────
app.use(express.static(path.join(__dirname, '../public')));


// ───────────── Body Parsing ─────────────
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(methodOverride('_method'));


// ───────────── Sessions (PostgreSQL Store) ─────────────
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));


// ───────────── Flash Messages ─────────────
app.use(flash());
app.use(flashLocals);


// ───────────── Routes ─────────────
registerRoutes(app);


// ───────────── Error Handler ─────────────
app.use(errorHandler);


// ───────────── Start Server ─────────────
const serverPort = process.env.PORT || PORT || 8080;

app.listen(serverPort, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║  MediStore Pro  →  http://localhost:${serverPort} ║`);
  console.log(`║  Environment    →  ${NODE_ENV.padEnd(17)}║`);
  console.log('╚══════════════════════════════════════╝\n');
});

module.exports = app;