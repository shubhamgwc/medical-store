const customerRepo = require('../repositories/customerRepository');

class CustomerService {
  async listCustomers(filters = {}) {
    return customerRepo.search(filters);
  }

  async getCustomerById(id) {
    const customer = await customerRepo.findByIdWithStats(id);
    if (!customer || !customer.is_active) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }
    return customer;
  }

  async getCustomerHistory(id) {
    await this.getCustomerById(id);
    return customerRepo.getRecentInvoices(id, 20);
  }

  async createCustomer(data) {
    this._validate(data);
    return customerRepo.create(data);
  }

  async updateCustomer(id, data) {
    this._validate(data);
    await this.getCustomerById(id);
    return customerRepo.update(id, data);
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id);
    return customerRepo.softDelete(id);
  }

  _validate(data) {
    if (!data.name || !data.name.trim()) {
      const err = new Error('Customer name is required');
      err.statusCode = 422;
      throw err;
    }
  }
}

module.exports = new CustomerService();
