(function() {
    function getMessageId(snapshot) {
        return snapshot.key().replace(/[^a-z0-9\-\_]/gi, '');
    }
    var app = angular.module("lownoise", ["firebase"]);

    app.controller("MyselfController", function($scope, $firebaseArray, $firebaseObject) {
        var name = prompt("Your name?", "Guest");

        var auser = {name: name, status: "SILENCE"};
        $scope.user = undefined;
        // Get a reference to the presence data in Firebase.
        var userListRef = new Firebase("https://sweltering-heat-795.firebaseio.com/users/");

        // Get a reference to my own presence status.
        var connectedRef = new Firebase("https://sweltering-heat-795.firebaseio.com/.info/connected");
        $scope.setUserStatus = function(status) {
            // Set our status in the list of online users.
            $scope.user.status= status;
            $scope.user.$save();
        };
        var connStatus = $firebaseObject(connectedRef);
        connectedRef.on('value', function(isOnline) {
            // A helper function to let us set our own state.
            if (isOnline.val()) {
                // Set our initial online status.
                console.log(isOnline.val());
                // Generate a reference to a new location for my user with push.
                $firebaseArray(userListRef).$add(auser).then(function(objRef){
                    $scope.user = $firebaseObject(objRef);
                    objRef.onDisconnect().remove();
                });
            }
            else {
                console.log(isOnline.val());
                // If we lose our internet connection, we want ourselves removed from the list.
            }

        });
        $scope.green = function(){
        	$scope.setUserStatus("NOISE");
        };
        $scope.red = function(){
        	$scope.setUserStatus("SILENCE");
        };

    });

    app.controller("UserController", function($scope, $firebaseArray) {
        //users list
        var userListRef = new Firebase("https://sweltering-heat-795.firebaseio.com/users/");
        $scope.users = $firebaseArray(userListRef);
        
    });

})();