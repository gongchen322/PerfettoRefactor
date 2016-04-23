module.exports = function (sequelize, DataTypes) {
	return sequelize.define('products', {
		product_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_color: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_price: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_gender: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_image1: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_image2: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_image3: {
			type: DataTypes.STRING,
			allowNull: false
		},
		product_description: {
			type: DataTypes.STRING
		}
	});
};
