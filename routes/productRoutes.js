const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct } = require('../controllers/productController.js');
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware.js")
const router = require('express').Router();


router.post('/create-product', authMiddleware, isAdmin, createProduct);
router.get('/:id', getProduct);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin,updateProduct);
router.delete('/:id', authMiddleware, isAdmin,deleteProduct);

module.exports = router;