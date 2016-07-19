angular.module('LoginCtrl', []).controller('LoginController', function($scope,$http,$location,$rootScope) {
	$scope.tagline = 'Login!';	
	$scope.submitForm = function(){
		$http.post('/api/v1/login', $scope.formData)
			.success(function(data) {
				$rootScope.r_userData = data;
				$location.path("/myaccount");
			})
			.error(function(error) {
				console.log('Error: ' + error);
			})
	}
	
	$scope.checkUserExists = function(){
		if('r_userData' in $rootScope){
			$location.path("/myaccount");
		}
	}
	
	//$scope.checkUserExists();
	
});