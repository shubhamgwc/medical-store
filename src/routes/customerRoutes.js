const { Router } = require('express');
const ctrl = require('../controllers/customerController');

const router = Router();

router.get('/',          (req, res) => ctrl.index(req, res));
router.get('/new',       (req, res) => ctrl.showCreateForm(req, res));
router.post('/',         (req, res) => ctrl.create(req, res));
router.get('/:id/edit',  (req, res) => ctrl.showEditForm(req, res));
router.put('/:id',       (req, res) => ctrl.update(req, res));
router.delete('/:id',    (req, res) => ctrl.destroy(req, res));

module.exports = router;
