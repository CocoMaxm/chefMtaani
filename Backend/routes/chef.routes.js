const express = require('express');
const router = express.Router();
const { getChefs, getChef, updateChef, getChefAvailability } = require('../controllers/chef.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(getChefs);

router.route('/:id')
    .get(getChef)
    .put(protect, authorize('chef'), updateChef);

router.get('/:id/availability', getChefAvailability);

module.exports = router;