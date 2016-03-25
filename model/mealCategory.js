
"use strict";

module.exports = function(sequelize, DataTypes) {
 
var MealCategory = sequelize.define('mealCategory', {
  name: Sequelize.STRING,
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

  return MealCategory;
};