angular.module('myAccountCtrl', []).controller('MyAccountController', function($scope,$http,$location,$rootScope) {
	$scope.message = 'My Account!';	
	$scope.getUserInfo = function(){
		 // Get all todos
		$http.get('/api/v1/getuserinfo')
        .success(function(data) {
			//alert("hi");
		   $rootScope.r_userData = data;
           $scope.userInfo = data;
           console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
	}
});