const { createOrder } = require('../controllers/orderControler.js');
const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWihslist, rating, addToCart, removeFromCart, applyCoupon, removeCoupon, uploadImages, getCart } = require('../controllers/productController.js');
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware.js")
const router = require('express').Router();

const upload = require("../config/multer.js");
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages.js');


router.post('/create-product', authMiddleware, isAdmin, createProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images',10),productImgResize, uploadImages);
router.get('/:id', getProduct);
router.put('/wishlist', authMiddleware, addToWihslist);
router.put('/cart', authMiddleware, addToCart);
router.put('/remove-cart', authMiddleware, removeFromCart);
router.post("/apply-coupon", authMiddleware, applyCoupon);
router.post("/remove-coupon", authMiddleware, removeCoupon);
router.post('/order', authMiddleware, createOrder);
router.put("/rating", authMiddleware, rating);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin,updateProduct);
router.delete('/:id', authMiddleware, isAdmin,deleteProduct);

module.exports = router;