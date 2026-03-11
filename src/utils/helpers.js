const generateInvoiceNumber = () => {
  const now  = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `INV-${date}-${rand}`;
};

const formatCurrency = (amount) => `\u20B9${parseFloat(amount || 0).toFixed(2)}`;

const formatDate = (date, locale = 'en-IN') =>
  date ? new Date(date).toLocaleDateString(locale) : '--';

const calcTotals = (subtotal, discountPct = 0, taxPct = 0) => {
  const sub     = parseFloat(subtotal)    || 0;
  const dPct    = parseFloat(discountPct) || 0;
  const tPct    = parseFloat(taxPct)      || 0;
  const discAmt = +(sub * dPct / 100).toFixed(2);
  const taxAmt  = +((sub - discAmt) * tPct / 100).toFixed(2);
  const total   = +(sub - discAmt + taxAmt).toFixed(2);
  return { subtotal: +sub.toFixed(2), discountAmount: discAmt, taxAmount: taxAmt, total };
};

module.exports = { generateInvoiceNumber, formatCurrency, formatDate, calcTotals };
