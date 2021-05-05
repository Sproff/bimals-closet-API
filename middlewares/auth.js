const jwt = require('jsonwebtoken')

const User = require("../model/user.model")

const { ErrorHandler } = require('../utils/errorHandler')

const isLoggedIn = async (req, res, next) => {
  try {
    // 1. check if token is present
    const token = req.headers.authorization
    if (!token)
      throw new ErrorHandler(401, 'Unauthorized: You need to be logged in')

    // 2. verify that token is valid
    const decoded = await jwt.verify(token.split(' ')[1], process.env.JWT_KEY)

    // 3. find the user with the token
    const user = await User.findById(decoded.sub)
    if (!user) throw new ErrorHandler(401, 'Unauthorized: Invalid token')

    // 4. store the user details in the request object
    req.user = user

    next()
  } catch (error) {
    next(new ErrorHandler(401, error.message))
  }
}

module.exports = {
  isLoggedIn,
}
