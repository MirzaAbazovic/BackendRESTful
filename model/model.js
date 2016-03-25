
var MealOption = sequelize.define('mealOption', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});


var MealCategory = sequelize.define('mealCategory', {
  name: Sequelize.STRING,
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var MealSizePrice = sequelize.define('mealSizePrice', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

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