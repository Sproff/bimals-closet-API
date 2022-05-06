const Order = require('../models/order.model');

const createOrder = async (req, res, next) => {
  try {
    const data = req.body;
    const order = await Order.create({ ...data, user: req.user._id });

    res.status(200).json({
      status: 'success',
      message: "Order has been created successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getParticularOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user products.product');
    if (!order) throw new ErrorHandler(404, 'Order does not exist');

    res.status(200).json({
      status: 'success',
      message: "Order has been fetched successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const order = await Order.find({ user: req.user._id }).populate(
      'user products.product'
    );

    res.status(200).json({
      status: 'success',
      message: "Orders has been fetched successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getParticularOrder, getMyOrders };
