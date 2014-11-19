app.controller('BookListCtrl', function($scope, $rootScope, $http, $timeout, jsonFilter, user, $mdDialog, $mdToast, $location) {
	
  $rootScope.toasttype = {
    typ: '',
    msg: ''
  };



  $rootScope.bookList = [];
  $rootScope.num_matches = 0;
  $rootScope.num_offers = 0;
  $rootScope.num_requests = 0;

  $scope.$watch('bookList',function(){
      var num_matches = 0,
          num_offers = 0,
          num_requests = 0;

      for(var i = 0; i < $scope.bookList.length; i++) {
          if($scope.bookList[i].matched == 'yes') {
            num_matches++;
          }
          else if($scope.bookList[i].actionType == "offer")
          {
            num_offers++;
          }
          else {
            num_requests++;
          }
      }

      if(num_matches == ($scope.num_matches+1)){
        $rootScope.toasttype.typ = "SEE IT";
        $rootScope.toasttype.msg = 'We already found a match for you!';

        $mdToast.show({
          controller: ToastCtrl,
          templateUrl: 'views/toast.html',
          hideDelay: 6000,
          position: $scope.getToastPosition()
        });
      }else if(((num_requests == ($scope.num_requests+1)) || (num_offers == ($scope.num_offers+1))) && ($rootScope.searchList != null)){
        $rootScope.toasttype.typ = "DONE";
        $rootScope.toasttype.msg = "For now we couldn't match your book(s). However, you'll be notified as soon as we find a match";

        $mdToast.show({
          controller: ToastCtrl,
          templateUrl: 'views/toast.html',
          hideDelay: 6000,
          position: $scope.getToastPosition()
        });
      }
      $scope.num_matches = num_matches;
      $scope.num_offers = num_offers;
      $scope.num_requests = num_requests;
  }, true);



  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: true,
    right: true
  };

  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };
  
  user.getBooks().then(
    function(data){
      $rootScope.bookList = data;
      console.log($rootScope.bookList);
    }, 
    function (err) {
      console.log('Failed: ' + err);
    });
  
	  user.getUser().then(function(data){
		  $scope.location = data;
	  }, 
	  function (err) {
		  console.log('Failed: ' + err);
	  });

  $scope.orderProp = 'title';




		  
	$rootScope.deleteBook = function(book){
    var index = $scope.bookList.indexOf(book);
    $rootScope.toasttype.typ = 'UNDO';
    $rootScope.toasttype.msg = 'You deleted a book!';
    
    $mdToast.show({
      controller: ToastCtrl,
      templateUrl: 'views/toast.html',
      hideDelay: 6000,
      position: $scope.getToastPosition()
    });
    
    if (index > -1) {
        $scope.bookList.splice(index, 1);
    }

    user.activeBookProperties.key = book.key;
		user.deleteBook();	
	};
	
	$rootScope.unmatchBook = function(book){

   var index = $scope.bookList.indexOf(book);

    if (index > -1) {
        $scope.bookList.splice(index, 1);
    }

		user.activeBookProperties.key = book.key;
		user.activeBookProperties.matchDate = book.matchDate;
		user.activeBookProperties.isbn = book.isbn;
		user.actionType = book.actionType;
		user.activeBookProperties.title = book.title;
		user.activeBookProperties.edition = book.edition;
		user.unmatchTextbook();	
	};

  $scope.dialog = function(ev, actionType) {

    if($rootScope.currentTab == 'matches') {
      $rootScope.currentTab = actionType;
    }

    $location.path('/main/' + $rootScope.currentTab + '/add/search').replace();

    $mdDialog.show({
      templateUrl: 'views/addBook.html',
      targetEvent: ev,
      controller: 'addBookCtrl'
    }).then(function(addBookConfirmed) {
        if (addBookConfirmed){
          user.addBook().then(
            function(data)
            {
              $scope.bookList.push(data);
              user.bookList.push(data);
            },
            function(err)
            {
              console.log('Failed: ' + err);
            });
        }
    
    });
  };

	
  });

/*    Filters Start    */  
app.filter('isOffer', function () {
    return function (items) {
      var filtered = [];

      if(!items)
        return [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.actionType == 'offer' && item.matched == 'no') {
          filtered.push(item);
        }
      }
    return filtered;
  };
});
app.filter('isRequest', function () {
    return function (items) {
      var filtered = [];

      if(!items)
        return [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.actionType == 'request' && item.matched == 'no') {
          filtered.push(item);
        }
      }
      return filtered;
    };
  });
app.filter('isMatch', function () {
    return function (items) {
      var filtered = [];

      if(!items)
        return [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.matched == 'yes') {
          filtered.push(item);
        }
      }
      return filtered;
    };
  });



function ToastCtrl($scope, $rootScope, $mdToast, $animate, $location) {

  $scope.closeToast = function() {
    if($rootScope.toasttype.typ == 'UNDO'){
      $scope.undoDelete();
    }else if($scope.toasttype.typ == 'DONE'){
      $mdToast.hide();
    }
    else{
      $scope.see();
    }
  };

$scope.see = function() {
    $rootScope.currentTab = 'matches';
    $location.path('/main/' + $rootScope.currentTab).replace();
    $mdToast.hide();
  };

$scope.undoDelete = function() {
    alert('called');
    $mdToast.hide();
  };
  


}


  
/*    Filters End    */

