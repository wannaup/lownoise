
(function() {
    var FIREURL = "https://lownoise.firebaseio.com/"
    var colors = ['#3f7cac','#2ebaac','#d77764','#6de06f','#c89bf7'];
    var notifyNoise = function(u){
        if (Notification.permission === "granted"){
            var n = new Notification('LowNoise', {
                body: u.name + ' can now listen to you!',
                icon: window.location.origin + '/assets/img/notification.png'
            });
            n.onShow(function(){
                setTimeout(function(){ n.close(); }, 6000);
            });
        }
    };
    function getMessageId(snapshot) {
        return snapshot.key().replace(/[^a-z0-9\-\_]/gi, '');
    }
    var app = angular.module("lownoise", ["firebase", "ngAnimate"]);

    app.controller("MainController", function($scope, $rootScope){
        $scope.loggedin = false;
        $scope.user={username : undefined};
        $scope.login = function(){
            //do logn
            $rootScope.username = $scope.user.username;
            $scope.loggedin = true;
        };
        
    });

    app.controller("MyselfController", function($scope, $rootScope, $firebaseArray, $firebaseObject) {
        var name = $rootScope.username;
        var auser = {name: name, status: "SILENCE", message: 'Hello'};
        $scope.user = auser;
        $rootScope.myself = $scope.user;
        // Get a reference to the presence data in Firebase.
        var userListRef = new Firebase(FIREURL + "users/");

        // Get a reference to my own presence status.
        var connectedRef = new Firebase(FIREURL + ".info/connected");
        function setUserStatus(status) {
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
                var userarr = $firebaseArray(userListRef);
                userarr.$add(auser).then(function(objRef){
                    var theuser = $firebaseObject(objRef);
                    theuser.$loaded(function(){
                      theuser.color = colors[userarr.$indexFor(objRef.key())];
                      theuser.$save();
                      $scope.user = theuser;  
                    });
                    
                    objRef.onDisconnect().remove();
                });
            }
            else {
                console.log(isOnline.val());
                // If we lose our internet connection, we want ourselves removed from the list.
            }

        });
        $scope.green = function(){
        	setUserStatus("NOISE");
        };
        $scope.red = function(){
        	setUserStatus("SILENCE");
        };

    });

    app.controller("UserController", function($scope, $rootScope, $firebaseArray) {
        //users list
        var userListRef = new Firebase(FIREURL + "users/");
        $scope.users = $firebaseArray(userListRef);
        $scope.users.$watch(function(e,b,c){
            if(e.event != "child_changed")
                return;
            var u = $scope.users.$getRecord(e.key);
            console.log(u);
            if($scope.listenToUsers.indexOf(u.$id) > -1){
                u.listen = true;
                //notify?
                if (u.status == "NOISE")
                    notifyNoise(u);
            }
            
        });
        $scope.listenToUsers = [];
        $scope.listenUser = function(user){
            if($scope.listenToUsers.indexOf(user.$id) < 0){
                $scope.listenToUsers.push(user.$id);
                user.listen = true;
            }
            else{
                $scope.listenToUsers.splice($scope.listenToUsers.indexOf(user.$id), 1);
                user.listen = false;
            }
            //request permission
            if(Notification.permission !== 'granted'){
                Notification.requestPermission(function (permission) {
                // If the user is okay, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Notifications ready.");
                }
            });
            } 

        };
            console.log($rootScope.myself);

    });

})();

