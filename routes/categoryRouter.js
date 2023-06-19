
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories } = require("../controllers/categoryController.js");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware.js")
const router = require('express').Router();


router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/", getAllCategories);



module.exports = router;