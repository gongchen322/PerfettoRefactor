module.exports = function (sequelize, DataTypes) {
	return sequelize.define('order', {
		Customer_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		Customer_email: {
			type: DataTypes.STRING,
			allowNull: false,
	
		},
		shipping_address: {
			type: DataTypes.STRING,
			allowNull: false,
	
		},
		billing_address: {
			type: DataTypes.STRING,
			allowNull: false,
	
		},
		totalPrice: {
			type: DataTypes.STRING,
			allowNull: false,
	
		},
		totalItems: {
			type: DataTypes.STRING,
			allowNull: false,

		},
		Date: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	});
};
