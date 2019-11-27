const express = require('express');
const router = express.Router();
const {createUser,getUser,getUsers,updateUser,deleteUser} = require('../controllers/users')

const User = require('../models/User')


const advancedResults = require('../middleware/advancedResult')
const {protect, authorize} = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;