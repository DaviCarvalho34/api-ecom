const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWihslist, rating, addToCart } = require('../controllers/productController.js');
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware.js")
const router = require('express').Router();


router.post('/create-product', authMiddleware, isAdmin, createProduct);
router.get('/:id', getProduct);
router.put('/wishlist', authMiddleware, addToWihslist);
router.put('/cart', authMiddleware, addToCart);
router.put("/rating", authMiddleware, rating);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin,updateProduct);
router.delete('/:id', authMiddleware, isAdmin,deleteProduct);

module.exports = router;