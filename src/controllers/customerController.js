const customerService = require('../services/customerService');
const { flashSuccess, flashError, handleServerError } = require('../utils/response');

class CustomerController {
  async index(req, res) {
    try {
      const { search } = req.query;
      const customers  = await customerService.listCustomers({ search });
      res.render('customers/index', { customers, search, page: 'customers' });
    } catch (err) {
      handleServerError(res, err, 'CustomerController.index');
    }
  }

  showCreateForm(req, res) {
    res.render('customers/form', { customer: null, page: 'customers' });
  }

  async create(req, res) {
    try {
      await customerService.createCustomer(req.body);
      flashSuccess(req, res, `Customer "${req.body.name}" added!`, '/customers');
    } catch (err) {
      flashError(req, res, err.message, '/customers/new');
    }
  }

  async showEditForm(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.render('customers/form', { customer, page: 'customers' });
    } catch (err) {
      flashError(req, res, err.message, '/customers');
    }
  }

  async update(req, res) {
    const { id } = req.params;
    try {
      await customerService.updateCustomer(id, req.body);
      flashSuccess(req, res, 'Customer updated!', '/customers');
    } catch (err) {
      flashError(req, res, err.message, `/customers/${id}/edit`);
    }
  }

  async destroy(req, res) {
    try {
      const customer = await customerService.deleteCustomer(req.params.id);
      flashSuccess(req, res, `Customer "${customer.name}" removed.`, '/customers');
    } catch (err) {
      flashError(req, res, err.message, '/customers');
    }
  }
}

module.exports = new CustomerController();
