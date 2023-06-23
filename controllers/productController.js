const Product = require('../models/productModel.js');
const User = require("../models/userModel.js");
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbid.js');


const createProduct = asyncHandler(async (req, res) => {
    try {

        if(req.body.title) {
            req.body.slug = slugify(req.body.title)
        }

        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if(req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {new: true});
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {  
      const deleteProduct = await Product.findByIdAndDelete(id);
      res.json(deleteProduct);
    } catch (error) {
      throw new Error(error);
    }
  });



const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id).populate("category").populate("brand");
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach((el) => delete queryObj[el]);
        console.log(queryObj);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        
        if(req.query.sort) {
          const sortBy = req.query.sort.split(",").join(" ");
          query = query.sort(sortBy);
        } else {
          query = query.sort("-createdAt");
        }

        if (req.query.fields) {
          const fields = req.query.fields.split(",").join(" ");
          
          query = query.select(fields);
        } else {
          query = query.select("-__v");
        }

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page) {
          const productCount = await Product.countDocuments();
          if(skip >= productCount) throw new Error("This Page does not exists");
        }

        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }

});

const addToWihslist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if(alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const addToCart = asyncHandler(async (req,res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const productsIds = await user.cart.prodId;
    const products = await Product.find({ _id: { $in: productsIds } });
    
    
    const alreadyadded = user.cart.prodId.find((id) => id.toString() === prodId);
 
    if(alreadyadded) {
      
       const updateCart = await User.findByIdAndUpdate(
        _id, 
        {
          $pull: {
            'cart.prodId':prodId
          }
        },
        
        { new: true }
       )
      const prices = products.map((products) => products.price);

      const actualProduct = products.map((products) => {
        if(products.id === prodId) {
          return products.price;
        }
      });

      const totalPrice = prices.reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'number' && !isNaN(currentValue)) {
          return accumulator + currentValue;
        }
        return accumulator;
      }, 0);
      console.log(totalPrice - actualProduct);
        
       res.json(updateCart);
    } else {
      const updateCart = await User.findByIdAndUpdate(
        _id,
        {
          $push: {
            'cart.prodId':prodId
          }
        },
        { new: true }
      )


      const prices = products.map((products) => products.price);
      
      const actualProduct = products.map((products) => {
        if(products.id === prodId) {
          return products.price;
        }
      });
     

      const totalPrice = prices.reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'number' && !isNaN(currentValue)) {
          return accumulator + currentValue;
        }
        return accumulator;
      }, 0);
      console.log(totalPrice + actualProduct);
    
      res.json(updateCart);
    }

  } catch (error) {
    throw new Error(error);
  }
})

const rating = asyncHandler(async (req,res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if(alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      )
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      )     
    }
    const getAllratings = await Product.findById(prodId);
    let totalRating = getAllratings.ratings.length;
    let ratingsum = getAllratings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(prodId, 
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWihslist, rating, addToCart }