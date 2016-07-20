angular.module('StudentListCtrl', []).controller('StudentListController', function($scope,$http,$location,$rootScope,$window) {
	$scope.pageHeader = 'Student Management';	
	$scope.r_userData = {};
	$scope.modelsteps = '1';
	$scope.showList = 'active';
	$scope.successMsg = false;
	$scope.dogetStudentList = function(){
		   $scope.showList = 'active';
		   $http.get('/api/v1/getstudentlist')
			.success(function(data) {
			   $scope.studentList = data;
			})
			.error(function(error) {
				console.log('Error: ' + error);
			});
	};
	
	$scope.submitForm = function(){
		$scope.modelsteps = '1';
		$http.post('/api/v1/addnewstudent', $scope.r_userData)
			.success(function(data) {
				$scope.r_userData.studentID = data[0];
				$scope.modelsteps = '2';
			})
			.error(function(error) {
				console.log('Error: ' + error);
			})
		
	};
	
	$scope.updateStudentInfo = function(stuid) {
		var s_data = {student_id:stuid};
		var config = {params: s_data};
		$http.get('/api/v1/updatestudent',config)
			.success(function(data) {
			   $scope.successMsg = 'student has been activated successfully. you can see the updates in active list';
			   $scope.doGetpendingList();
			})
			.error(function(error) {
				console.log('Error: ' + error);
		}); 
		
	}
	
	$scope.doGetpendingList = function(){
		$scope.modelsteps = '1';
		$scope.showList = 'pending';
		$http.get('/api/v1/getstudentpendinglist')
		.success(function(data) {
		   $scope.studentList = data;
		})
		.error(function(error) {
			console.log('Error: ' + error);
		});
	}
	
	$scope.closeModal = function(step){
		if($scope.modelsteps == 2){
			$window.location.href = '/studentlist';
			$window.location.reload();
		}
		/*if($(document).hasClass("modal-backdrop")){
			$(".modal-backdrop").remove();
			$("#"+modelID).hide();
		}*/
		
		
	}
});