const Product = require('../models/productModel.js');
const User = require("../models/userModel.js");
const Coupon =  require("../models/couponModel.js");
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbid.js');
const { cloudinaryUploadImg } = require('../utils/cloudinary.js');


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

const addToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);

    // Verificar se o produto já está no carrinho
    const cartItem = user.cart.find(item => item.product.toString() === prodId);

    if (cartItem) {
      // Se o produto já está no carrinho, atualize a quantidade
      cartItem.qty += 1;
    } else {
      // Se o produto não está no carrinho, adicione-o com quantidade 1
      user.cart.push({
        product: prodId,
        qty: 1,
      });
    }

    // Atualizar o preço total do carrinho
    let totalCartPrice = 0;

    for (const item of user.cart) {
      const product = await Product.findById(item.product);
      totalCartPrice += item.qty * product.price;
    }

    user.totalCartPrice = totalCartPrice;

    await user.save();

    res.json(user.cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);

    // Encontrar o índice do produto no carrinho
    const productIndex = user.cart.findIndex(item => item.product.toString() === prodId);

    if (productIndex !== -1) {
      // Remover o produto do carrinho
      user.cart.splice(productIndex, 1);

      // Atualizar o preço total do carrinho
      let totalCartPrice = 0;

      for (const item of user.cart) {
        const product = await Product.findById(item.product);
        totalCartPrice += item.qty * product.price;
      }

      user.totalCartPrice = totalCartPrice;

      await user.save();

      res.json(user.cart);
    } else {
      res.status(404).json({ message: 'Produto não encontrado no carrinho' });
    }
  } catch (error) {
    throw new Error(error);
  }
});





const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });

  // Verificar se o cupom já está aplicado
  const isCouponApplied = user.cart.some((item) => item.couponApplied === true);
  console.log(isCouponApplied)
  if (isCouponApplied) {
    // O cupom já está aplicado, não faz nada
    res.json({ message: "Coupon already applied" });
    return;
  }

  let totalAfterDiscount = (
    user.totalCartPrice - (user.totalCartPrice * validCoupon.discount) / 100
  ).toFixed(2);

  const updateTotal = await User.findByIdAndUpdate(
    _id,
    {
      totalCartPrice: Number(totalAfterDiscount),
      $set: { "cart.$[elem].couponApplied": true },
    },
    {
      arrayFilters: [{ "elem.couponApplied": false }],
      new: true,
    }
  );
  
  res.json(updateTotal);
});

const removeCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });

  // Verificar se o cupom já está removido
  const isCouponApplied = user.cart.some((item) => item.couponApplied === true);
  if (!isCouponApplied) {
    // O cupom já está removido, não faz nada
    res.json({ message: "Coupon already removed" });
    return;
  }

  let totalAfterDiscount = user.totalCartPrice; // Inicializa com o valor original

  if (validCoupon.discount > 0) {
    // Calcula o novo total removendo o desconto do cupom
    totalAfterDiscount = (
      user.totalCartPrice + (user.totalCartPrice * validCoupon.discount) / 100
    ).toFixed(2);
  }

  const updateTotal = await User.findByIdAndUpdate(
    _id,
    {
      totalCartPrice: Number(totalAfterDiscount),
      $set: { "cart.$[elem].couponApplied": false },
    },
    {
      arrayFilters: [{ "elem.couponApplied": true }],
      new: true,
    }
  );

  res.json(updateTotal);
});

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

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const uploader = (path) => cloudinaryUploadImg(path);
    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;  
      const newpath = await uploader(path);
      console.log(file);
      urls.push(newpath);
    }

    const findProduct = await Product.findByIdAndUpdate(id, {
      images: urls.map((file) => file),
    }, {
      new: true,
    });

    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});




module.exports = { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWihslist, rating, addToCart, removeFromCart, applyCoupon, removeCoupon, uploadImages }