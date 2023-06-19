const { Schema } = require('mongoose');
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
      },
      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
      brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
      quantity: {
        type: Number,
        required: true,
      },
      images: {
        type: Array
      },
      sold: {
        type: Number,
        default: 0,
      },
      tags: String,
      ratings: [
        {
            star: Number,
            comment: String,
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
    totalrating: {
      type: String,
      default: 0,
    },
},{ timestamps: true });

//Export the model
module.exports = mongoose.model('Product', ProductSchema);