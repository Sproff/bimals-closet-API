const router = require('express').Router();
const {createUser, loginUser} = require('../controllers/user.controller');


router.route('/sign-up').post(createUser);

router.route('/login').post(loginUser);

// router.route('/logout').post(checkAuthorization, logoutUser);

module.exports = router;
