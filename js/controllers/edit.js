app.controller('EditController', ['$scope', '$rootScope', '$location', '$compile', function(scope, root, location, compile) {
	scope.current_color = '#ffffff';
	scope.product = {};
	scope.colors = [];
	scope.variations = [];
	scope.loading = true;

	//FUNCTIONS
	scope.get_product = function() {
		scope.loading = true;
		$.ajax({
			type: 'GET',
			url: 'php/products.php?id=' + location.$$search.id,
			dataType: 'json',
			success: function(data) {
				scope.product = data[0];
				scope.colors = JSON.parse(scope.product.colors);
				scope.variations = JSON.parse(scope.product.variations);
				scope.current_variation = scope.variations[0];
				scope.loading = false;
				console.log(scope.product);
				scope.$apply();
			},
			error: function(data) {
				console.log('error', data);
				alert('Could not get product');
			}
		});
	};
	scope.get_product();

	scope.color_panel = function(colors, $event) {
		var panel = $($event.target);
		panel.attr('fill', scope.current_color);
		$.each(scope.variations, function(i, variation) {
			if (variation.name === scope.current_variation.name) {
				variation.svg = $('.template').html();
				return false;
			}
		});
	};

	scope.color_group = function(colors, $event) {
		var group = $($event.target).parents('g');
		group.find('*').attr('fill', scope.current_color);
		$.each(scope.variations, function(i, variation) {
			if (variation.name === scope.current_variation.name) {
				variation.svg = $('.template').html();
				return false;
			}
		});	};

	scope.change_color = function(color) {
		scope.current_color = color;
	};
}]);