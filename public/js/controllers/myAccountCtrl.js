angular.module('myAccountCtrl', []).controller('MyAccountController', function($scope,$http,$location,$rootScope) {
	$scope.message = 'My Account!';	
	//$scope.subview = "views/nav-steps.html";
	$scope.getUserInfo = function(){
		 // Get all todos
		$http.get('/api/v1/getuserinfo')
        .success(function(data) {
		   $rootScope.r_userData = data;
           $scope.userInfo = data;
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
	}
});