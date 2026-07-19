const express = require('express');
const router = express.Router();
const {
  getShoppingList,
  addShoppingListItems,
  toggleBought,
  deleteShoppingListItem,
  clearShoppingList,
} = require('../controllers/shoppingList.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.route('/')
  .get(getShoppingList)
  .post(addShoppingListItems)
  .delete(clearShoppingList);

router.put('/:id/toggle', toggleBought);
router.delete('/:id', deleteShoppingListItem);

module.exports = router;
