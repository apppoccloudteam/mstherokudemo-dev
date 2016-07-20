angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/login.html',
			controller: 'LoginController',
			resolve : {
				checkRouting: checkRouting
			}
		})

		.when('/register', {
			templateUrl: 'views/register.html',
			controller: 'RegisterController'	
		})
		
		.when('/myaccount', {
			templateUrl: 'views/myaccount.html',
			controller: 'MyAccountController',
			resolve : {
				checkRouting: checkRouting
			}			
		})
		
		.when('/logout', {
			templateUrl: 'views/login.html',
			resolve : {
				doLogout: doLogout
			}	
		})
		
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginController',
			resolve : {
				checkRouting: checkRouting
			}			
		})
		
		.when('/studentlist', {
			templateUrl: 'admin/studentlist.html',
			controller: 'StudentListController',
			resolve : {
				checkRouting: checkRouting
			}			
		})
		
		
		
		.when('/dashboard', {
			templateUrl: 'admin/dashboard.html',
			controller: 'DashboardController',
			resolve : {
				checkRouting: checkRouting
			}			
		});

	$locationProvider.html5Mode(true);

}]);

checkRouting = function($http,$location,$rootScope){
	var isStudentLogged = function(){
		if(typeof($rootScope.r_userData) != "undefined"){
			 $rootScope.userloggedin = true;
		}else{
			$http.get('/api/v1/getuserinfo').success(function(data) {
				 $rootScope.userloggedin = true
				 $rootScope.r_userData = data;
			})
			.error(function(error) {
				console.log('Error: ' + error);
			});
		}
	}
	isStudentLogged();
}


doLogout = function($http,$location,$rootScope){
		$http.get('/api/v1/logout').success(function(data) {
			$rootScope.r_userData = {};
			$location.path("/");
			$rootScope.userloggedin = false;
		})
		.error(function(error) {
			console.log('Error: ' + error);
		})
}