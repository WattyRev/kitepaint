app.controller('LoginController', ['$scope', '$rootScope', '$state', function(scope, root, state) {
	//variables
	scope.screen = 'login';

	//functions
	scope.check_user = function() {
		if(!localStorage.retailer) {
			return;
		}
		var retailer = JSON.parse(localStorage.retailer);
		if (!retailer || !retailer.id || !retailer.actcode) {
			console.log('clear1');
			localStorage.retailer = '';
			return;
		}
		var data = {
			id: retailer.id,
			actcode: retailer.actcode,
			check_user: true
		};
		$.ajax({
			type: 'POST',
			data: data,
			dataType: 'json',
			url: '../php/retailers.php',
			success: function(data) {
				if(data.valid) {
					root.retailer = retailer;
					root.success('Welcome back!');
					state.go('orders');
					root.$apply();
				} else {
					localStorage.retailer = '';
					return;
				}
			},
			error: function(data) {
				localStorage.retailer = '';
				return;
			}
		});
	};
	scope.check_user();

	scope.login = function() {
		var data = {
			login: true,
			username: scope.username,
			password: scope.password
		};
		$.ajax({
			type: 'POST',
			data: data,
			dataType: 'json',
			url: '../php/retailers.php',
			success: function(data) {
				if(!data.valid) {
					root.error(data.message || 'Could not log in. Try again later.');
					root.$apply();
					return;
				}
				data.message.product_opt_out = JSON.parse(data.message.product_opt_out);
				data.message.product_urls = JSON.parse(data.message.product_urls);
				data.message.id = parseInt(data.message.id);
				root.retailer = data.message;
				localStorage.retailer = JSON.stringify(root.retailer);
				root.$apply();
				state.go('orders');
			},
			error: function(data) {
				root.error('Could not log in. Try again later.');
				root.$apply();
			}
		});
	};

	scope.reset = function() {
		var data = {
			reset_password: true,
			username: scope.rp_username,
			email: scope.rp_email
		};
		$.ajax({
			type: 'POST',
			dataType: 'json',
			data: data,
			url: '../php/retailers.php',
			success: function(data) {
				if(data.valid) {
					root.success('A new password has been sent to your email');
					scope.screen = 'login';
					root.$apply();
				} else {
					root.error(data.message || 'Could not reset password. Try again later.');
					console.log('error', data);
					root.$apply();
				}
			},
			error: function(data) {
				root.error('Could not reset password. Try again later.');
				console.log('error', data);
				root.$apply();
			}
		});
	};

	scope.get_username = function() {
		var data = {
			get_username: true,
			email: scope.gu_email
		};
		$.ajax({
			type: 'POST',
			dataType: 'json',
			data: data,
			url: '../php/retailers.php',
			success: function(data) {
				if(data.valid) {
					root.success('Your username has been sent to your inbox');
					scope.screen = 'login';
					root.$apply();
				} else {
					root.error(data.message || 'Could not get username password. Try again later.');
					console.log('error', data);
					root.$apply();
				}
			},
			error: function(data) {
				root.error('Could not get username password. Try again later.');
				console.log('error', data);
				root.$apply();
			}
		});
	};
}]);