const { Router } = require('express');
const ctrl = require('../controllers/saleController');

const router = Router();

router.get('/',              (req, res) => ctrl.index(req, res));
router.get('/new',           (req, res) => ctrl.showNewSaleForm(req, res));
router.post('/',             (req, res) => ctrl.create(req, res));
router.get('/:id/receipt',   (req, res) => ctrl.showReceipt(req, res));
router.delete('/:id',        (req, res) => ctrl.destroy(req, res));

module.exports = router;
