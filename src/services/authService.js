const bcrypt        = require('bcrypt');
const authRepo      = require('../repositories/authRepository');

const SALT_ROUNDS = 10;

class AuthService {

  // ─── Register ─────────────────────────────────────────────────────────────
  async register({ name, email, password, confirm_password }) {
    // Basic validation
    if (!name || !name.trim())     throw Object.assign(new Error('Name is required'), { statusCode: 422 });
    if (!email || !email.trim())   throw Object.assign(new Error('Email is required'), { statusCode: 422 });
    if (!password)                 throw Object.assign(new Error('Password is required'), { statusCode: 422 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))   throw Object.assign(new Error('Invalid email address'), { statusCode: 422 });
    if (password.length < 6)       throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 422 });
    if (password !== confirm_password) throw Object.assign(new Error('Passwords do not match'), { statusCode: 422 });

    // Check duplicate email
    const existing = await authRepo.findByEmail(email.toLowerCase().trim());
    if (existing) throw Object.assign(new Error('An account with this email already exists'), { statusCode: 409 });

    // Hash & create
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user   = await authRepo.create({
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    return user;
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  async login({ email, password }) {
    if (!email || !password) throw Object.assign(new Error('Email and password are required'), { statusCode: 422 });

    const user = await authRepo.findByEmail(email.toLowerCase().trim());
    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    return user;
  }
}

module.exports = new AuthService();
