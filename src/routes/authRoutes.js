const { Router } = require('express');
const ctrl = require('../controllers/authController');

const router = Router();

router.get('/login',    (req, res) => ctrl.showLogin(req, res));
router.get('/register', (req, res) => ctrl.showRegister(req, res));
router.post('/login',   (req, res) => ctrl.login(req, res));
router.post('/register',(req, res) => ctrl.register(req, res));
router.post('/logout',  (req, res) => ctrl.logout(req, res));

module.exports = router;
