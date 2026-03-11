const { Router } = require('express');
const ctrl = require('../controllers/reportController');

const router = Router();

router.get('/', (req, res) => ctrl.index(req, res));

module.exports = router;
