const medicineService = require('../services/medicineService');
const { flashSuccess, flashError, handleServerError } = require('../utils/response');
const { MEDICINE_UNITS } = require('../config/constants');

class MedicineController {
  async index(req, res) {
    try {
      const { search, category } = req.query;
      const [medicines, categories] = await Promise.all([
        medicineService.listMedicines({ search, category }),
        medicineService.getCategories(),
      ]);
      res.render('medicines/index', {
        medicines, categories, search, category,
        page: 'medicines',
      });
    } catch (err) {
      handleServerError(res, err, 'MedicineController.index');
    }
  }

  showCreateForm(req, res) {
    res.render('medicines/form', {
      medicine: null,
      units: MEDICINE_UNITS,
      page: 'medicines',
    });
  }

  async create(req, res) {
    try {
      await medicineService.createMedicine(req.body);
      flashSuccess(req, res, `Medicine "${req.body.name}" added successfully!`, '/medicines');
    } catch (err) {
      flashError(req, res, err.message, '/medicines/new');
    }
  }

  async showEditForm(req, res) {
    try {
      const medicine = await medicineService.getMedicineById(req.params.id);
      res.render('medicines/form', {
        medicine,
        units: MEDICINE_UNITS,
        page: 'medicines',
      });
    } catch (err) {
      flashError(req, res, err.message, '/medicines');
    }
  }

  async update(req, res) {
    const { id } = req.params;
    try {
      const medicine = await medicineService.updateMedicine(id, req.body);
      flashSuccess(req, res, `"${medicine.name}" updated successfully!`, '/medicines');
    } catch (err) {
      flashError(req, res, err.message, `/medicines/${id}/edit`);
    }
  }

  async destroy(req, res) {
    try {
      const medicine = await medicineService.deleteMedicine(req.params.id);
      flashSuccess(req, res, `"${medicine.name}" removed from inventory.`, '/medicines');
    } catch (err) {
      flashError(req, res, err.message, '/medicines');
    }
  }

  async restock(req, res) {
    const { id } = req.params;
    try {
      const { quantity, reason } = req.body;
      const med = await medicineService.getMedicineById(id);
      await medicineService.restockMedicine(id, quantity, reason);
      flashSuccess(req, res, `Added ${quantity} units to "${med.name}".`, '/medicines');
    } catch (err) {
      flashError(req, res, err.message, '/medicines');
    }
  }
}

module.exports = new MedicineController();
