(function() {
    function getMessageId(snapshot) {
        return snapshot.key().replace(/[^a-z0-9\-\_]/gi, '');
    }
    var app = angular.module("lownoise", []);

    app.controller("MyselfController", function() {
        var name = prompt("Your name?", "Guest");

        this.currentStatus = "RED";
        var self = this;

        // Get a reference to the presence data in Firebase.
        var userListRef = new Firebase("https://sweltering-heat-795.firebaseio.com/");
        // Generate a reference to a new location for my user with push.
        var myUserRef = userListRef.push();
        // Get a reference to my own presence status.
        var connectedRef = new Firebase("https://sweltering-heat-795.firebaseio.com//.info/connected");
        this.setUserStatus = function(status) {
            // Set our status in the list of online users.
            self.currentStatus = status;
            myUserRef.set({
                name: name,
                status: status
            });
        };
        connectedRef.on("value", function(isOnline) {
            // A helper function to let us set our own state.

            if (isOnline.val()) {
                // If we lose our internet connection, we want ourselves removed from the list.
                myUserRef.onDisconnect().remove();

                // Set our initial online status.
                self.setUserStatus("RED");
            } else {

                // We need to catch anytime we are marked as offline and then set the correct status. We
                // could be marked as offline 1) on page load or 2) when we lose our internet connection
                // temporarily.
                self.setUserStatus(self.currentStatus);
            }

        });
        this.green = function(){
        	this.setUserStatus("NOISE");
        };
        this.red = function(){
        	this.setUserStatus("SILENCE");
        };

    });

    app.controller("UserController", function($scope) {
        //users list
        $scope.users = [];
        var userListRef = new Firebase("https://sweltering-heat-795.firebaseio.com/");
        // Update our GUI to show someone"s online status.
        userListRef.on("child_added", function(snapshot) {
            var user = snapshot.val();
            user.id = getMessageId(snapshot);
            $scope.users.push(user);
            console.log($scope.users);
            $scope.$apply();
        });

        // Update our GUI to remove the status of a user who has left.
        userListRef.on("child_removed", function(snapshot) {
            $scope.users = $scope.users.filter(function(item) {
                return item.id !== getMessageId(snapshot);
            });
            $scope.$apply();
        });

        // Update our GUI to change a user"s status.
        userListRef.on("child_changed", function(snapshot) {
            var user = snapshot.val();
            user.id = getMessageId(snapshot);
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].id == user.id) {
                    $scope.users[i] = user;
                    break;
                }
            }
            $scope.$apply();

        });

    });

})();