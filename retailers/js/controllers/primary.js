app.controller('PrimaryController', ['$scope', '$rootScope', '$state', '$location', '$window', function(scope, root, state, $location, $window) {

	//VARIABLES
		scope.current_page = '';
		root.base_url = environment === 'development' ? 'http://wattydev.com/projects/kite_paint' : 'http://kitepaint.com';
		root.user = localStorage.user ? JSON.parse(localStorage.user) : false;

	//FUNCTIONS
		scope.check_user = function() {
			if(!localStorage.retailer) {
				state.go('login');
				return;
			}
			var retailer = JSON.parse(localStorage.retailer);
			if (!retailer || !retailer.id || !retailer.actcode) {
				localStorage.retailer = '';
				state.go('login');
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
						root.$apply();
					} else {
						localStorage.retailer = '';
						state.go('login');
						return;
					}
				},
				error: function(data) {
					localStorage.retailer = '';
					state.go('login');
					return;
				}
			});
		};

		root.request_desktop_version = function() {
			create_cookie('desktop', true, 30);
			location.reload();
		};

		root.return_mobile_version = function() {
			erase_cookie('desktop');
			location.reload();
		};

		root.alert = function(type, message, confirm) {
			root.alert_content = {
				type: type,
				message: message,
				confirm: confirm ? true : false
			};
		};

		root.error = function(message, confirm) {
			root.alert('error', message, confirm);
		};

		root.success = function(message, confirm) {
			root.alert('success', message, confirm);
		};

		root.done = function(total) {
			root.load_count++;
			if (total >= root.load_count) {
				root.loading = false;
				root.load_count = 0;
				return;
			}
		};

	//LISTENERS
		//Update current page data
		root.$on('$stateChangeStart', function(event, toState) {
			scope.current_page = toState;
			if(scope.current_page !== 'login') {
				scope.check_user();
			}
			root.loading = true;
		});

		if (environment === 'production'){
			//update google analytics on successful page change
			root.$on('$stateChangeSuccess', function(event) {
				if (!$window.ga){
					return;
				}
				$window.ga('send', 'pageview', {page: $location.path()});
			});
		}

		//update has_account local storage variable
		root.$watch('user', function(user) {
			localStorage.user = JSON.stringify(user);
		}, true);

		window.root = root;
}]);