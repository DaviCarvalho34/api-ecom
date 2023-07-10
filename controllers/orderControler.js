const Product = require('../models/productModel.js');
const User = require("../models/userModel.js");
const Order = require("../models/orderModel.js");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid.js');


const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
      const user = await User.findById(_id);
      const cart = user.cart;
      const totalCartPrice = user.totalCartPrice;
      const { neighborhood, street, number } = req.body;
  
      if (!neighborhood || !street || !number) {
        return res.status(400).json({ error: 'Endereço incompleto' });
      }
  
      // Aqui você pode adicionar a lógica para processar o pagamento falso
      // Exemplo: Simulação de pagamento bem-sucedida
      const paymentSuccess = true;
  
      if (paymentSuccess) {
        // Crie um novo objeto de pedido
        const newOrder = new Order({
          user: user._id,
          cart: cart,
          paymentIntent: 'FAKE_PAYMENT_INTENT',
          orderStatus: 'Not Processed',
          totalPrice: totalCartPrice,
          orderBy: user._id,
        });
  
        // Salve o novo pedido no banco de dados
        const savedOrder = await newOrder.save();
  
        // Limpe o carrinho do usuário
        user.cart = [];
        user.totalCartPrice = 0;
        await user.save();
  
        res.json(savedOrder);
      } else {
        // Simulação de pagamento falhou
        res.status(500).json({ error: 'Falha na simulação de pagamento' });
      }
    } catch (error) {
      throw new Error(error);
    }
  });

module.exports = { createOrder }; 