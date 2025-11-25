const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  const products = adminData.products;
  // {prods: products} - Data object passed to the template
  // prods: Variable name used in the template
  // products: Actual data (array retrieved from adminData.products)
  res.render('shop', {prods: products, docTitle: 'Shop'});
});

module.exports = router;
