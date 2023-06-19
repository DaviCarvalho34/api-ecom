const Category = require('../models/categoryModel.js');
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbid.js');


const createCategory = asyncHandler(async (req, res) =>{
    try {
        
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newCategory = await Category.create(req.body);
        res.json(newCategory);

    } catch (error) {
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body,{ new: true });
        res.json(updatedCategory); 
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try { 
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory); 
    } catch (error) {
        throw new Error(error);
    }
});

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findCategory = await Category.findById(id); 
        res.json(findCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories }