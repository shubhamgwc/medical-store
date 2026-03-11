require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT:     parseInt(process.env.PORT) || 3000,

  SESSION_SECRET: process.env.SESSION_SECRET || 'medistore_dev_secret',

  STORE: {
    name:    process.env.STORE_NAME    || 'MediStore Pro',
    address: process.env.STORE_ADDRESS || '',
    phone:   process.env.STORE_PHONE   || '',
    email:   process.env.STORE_EMAIL   || '',
  },

  PAYMENT_METHODS: ['cash', 'upi', 'card', 'credit'],
  MEDICINE_UNITS:  ['strip', 'bottle', 'tablet', 'capsule', 'injection', 'syrup', 'cream', 'drops', 'sachet', 'other'],
  ADJUSTMENT_TYPES: ['purchase', 'sale', 'return', 'manual'],
};
