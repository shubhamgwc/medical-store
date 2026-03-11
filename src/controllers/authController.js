const authService = require('../services/authService');

class AuthController {

  // GET /auth/login
  showLogin(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { page: '', error: null });
  }

  // GET /auth/register
  showRegister(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { page: '', error: null });
  }

  // POST /auth/login
  async login(req, res) {
    try {
      const user = await authService.login(req.body);
      req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect('/');
    } catch (err) {
      res.render('auth/login', { page: '', error: err.message });
    }
  }

  // POST /auth/register
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role || 'admin' };
      req.flash('success', `Account created! Welcome, ${user.name}!`);
      res.redirect('/');
    } catch (err) {
      res.render('auth/register', { page: '', error: err.message });
    }
  }

  // POST /auth/logout
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  }
}

module.exports = new AuthController();
