angular.module('RegisterCtrl', []).controller('RegisterController', function($scope,$http,$location,$rootScope) {
	$scope.message = 'Register!';	
	$scope.r_userData = {};
	$scope.submitForm = function(){
		var TokenInfo = $location.search();
		$scope.r_userData.tokenID = TokenInfo.token;
		$http.post('/api/v1/savestudentinformation', $scope.r_userData)
			.success(function(data) {
				$rootScope.r_userData = data;
				$location.path("/myaccount");
				$location.url($location.path());
			})
			.error(function(error) {
				console.log('Error: ' + error);
			})
		
	}
	
	$scope.getUserInfoDetails = function(){
		var TokenInfo = $location.search();
		var config = {
			params: TokenInfo
		}
		$http.get('/api/v1/getuserinfo',config)
			.success(function(data) {
			   $scope.r_userData = data[0];
			})
			.error(function(error) {
				//console.log('Error: ' + error);
			});
	}
	
});