require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const morgan         = require('morgan');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

const { PORT, SESSION_SECRET, NODE_ENV } = require('./config/constants');
const flashLocals    = require('./middlewares/flashLocals');
const errorHandler   = require('./middlewares/errorHandler');
const registerRoutes = require('./routes/index');

const app = express();

// ─── Trust Proxy (required on Railway/Render/any reverse proxy) ──────────────
app.set('trust proxy', 1);

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             500,
  standardHeaders: true,
  legacyHeaders:   false,
  // Skip rate limiting errors in production — fail open so app stays up
  skip: () => false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message);
  },
}));

// if (process.env.NODE_ENV === 'production') {
//   require('./config/setupDb');
// }
// // ─── Logging ─────────────────────────────────────────────────────────────────
// if (NODE_ENV !== 'test') {
//   app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
// }

// ─── View Engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ─── Static Assets ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(methodOverride('_method'));

// ─── Sessions & Flash ────────────────────────────────────────────────────────
app.use(session({
  secret:            SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   24 * 60 * 60 * 1000,
  },
}));
app.use(flash());
app.use(flashLocals);

// ─── Routes ──────────────────────────────────────────────────────────────────
registerRoutes(app);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║  MediStore Pro  →  http://localhost:${PORT} ║`);
  console.log(`║  Environment    →  ${NODE_ENV.padEnd(17)}║`);
  console.log('╚══════════════════════════════════════╝\n');
});

module.exports = app;