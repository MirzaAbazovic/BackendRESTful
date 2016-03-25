var Meal = sequelize.define('meal', {
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  isMultipeSize: Sequelize.BOOLEAN,
  
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

Meal.belongsTo(MealCategory);