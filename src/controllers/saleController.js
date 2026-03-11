const saleService     = require('../services/saleService');
const medicineService = require('../services/medicineService');
const customerService = require('../services/customerService');
const { flashSuccess, flashError, handleServerError } = require('../utils/response');
const { PAYMENT_METHODS } = require('../config/constants');

class SaleController {
  async index(req, res) {
    try {
      const { search, from, to } = req.query;
      const invoices = await saleService.listInvoices({ search, from, to });
      res.render('sales/index', { invoices, search, from, to, page: 'sales' });
    } catch (err) {
      handleServerError(res, err, 'SaleController.index');
    }
  }

  async showNewSaleForm(req, res) {
    try {
      const [medicines, customers] = await Promise.all([
        medicineService.getMedicinesInStock(),
        customerService.listCustomers(),
      ]);
      res.render('sales/new', {
        medicines, customers,
        paymentMethods: PAYMENT_METHODS,
        page: 'sales',
      });
    } catch (err) {
      handleServerError(res, err, 'SaleController.showNewSaleForm');
    }
  }

  async create(req, res) {
    try {
      // items arrive as JSON string from the hidden field
      const items = JSON.parse(req.body.items || '[]');
      const invoice = await saleService.createSale({ ...req.body, items });
      res.redirect(`/sales/${invoice.id}/receipt`);
    } catch (err) {
      flashError(req, res, err.message, '/sales/new');
    }
  }

  async showReceipt(req, res) {
    try {
      const invoice = await saleService.getInvoiceWithItems(req.params.id);
      res.render('sales/receipt', { invoice, items: invoice.items, page: 'sales' });
    } catch (err) {
      flashError(req, res, err.message, '/sales');
    }
  }

  async destroy(req, res) {
    try {
      const invoice = await saleService.deleteSale(req.params.id);
      flashSuccess(req, res, `Invoice ${invoice.invoice_number} deleted. Stock restored.`, '/sales');
    } catch (err) {
      flashError(req, res, err.message, '/sales');
    }
  }
}

module.exports = new SaleController();
