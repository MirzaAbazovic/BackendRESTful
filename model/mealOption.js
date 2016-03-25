"use strict";

module.exports = function(sequelize, DataTypes){
var MealOption = sequelize.define('mealOption', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});
return MealOption;    
}
