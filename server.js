var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var sms = require('./sms.js');
var bcrypt = require('bcrypt');
var path = require('path');

var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());
app.use('/js',express.static(path.join(__dirname, '/js')));
app.use('/assets', express.static(path.join(__dirname, '/assets')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

//Get /product
app.get('/products/:gender', function (req,res) {
	var gender = req.params.gender;
	console.log(gender);
	var where = {
		product_gender: gender
	};

	db.products.findAll({where: where}).then(function (products) {
		res.json(products);
	}, function (e) {
		res.status(500).send();
	});
});

//Post /product
app.post('/products', function (req,res) {
	
		var body = _.pick(req.body, 'product_name', 'product_color', 'product_price','product_gender','product_image1', 'product_image2','product_image3','product_description');
		db.products.create(body).then(function (product) {
			res.json(product.toJSON());
		}, function (e) {
			res.status(400).json(e);
		});
});

// DELETE /products/:id

app.delete('/products/:id', function (req, res) {
	var productId = parseInt(req.params.id, 10);

	db.products.destroy({
		where: {
			id: productId
		}
	}).then(function (rowDeleted) {
		if(rowDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		}else {
			res.status(204).send();
		}
	}, function () {
			res.status(500).send();
		});
	});

//Get /orders
app.get('/orders', middleware.requireAuthentication, function (req,res) {
	var where = {
		userId: req.user.get('id')
	};

	db.order.findAll({where : where}).then (function (orders) {
		res.json(orders);
	}, function (e) {
		res.status(500).send();
	});
});

//POST /orders

app.post('/orders', middleware.requireAuthentication, function (req,res) {
	var body = _.pick(req.body, 'Customer_name', 'Customer_email', 'phone_number', 'shipping_address', 'billing_address', 'totalPrice', 'totalItems','Date');

	db.order.create(body).then(function (order) {
		req.user.addOrder(order).then(function () {
			return order.reload();
		}).then(function (order) {
			res.json(order.toJSON());
		});
	}, function (e) {
		res.status(400).json(e);
	});

	sms.sendMessage(body['phone_number'], body['totalPrice']);

});



app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'name','shipping_address','billing_address','phone_number','email', 'password');
	console.log(body);
	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	})
});

//POST /users/login

app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
		
	}).then(function (tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch (function (e) {
		res.status(401).send();
	});

	
});


// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication,function (req, res) {
	
	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});
});

db.sequelize.sync().then(function () {
		app.listen(PORT, function () {
		console.log('Express listening on port '+ PORT + '!');
	});
});



