var MealSizePrice = sequelize.define('mealSizePrice', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
})