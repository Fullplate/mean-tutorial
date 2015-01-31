angular.module('flapperNews', ['ui.router'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                })
                .state('posts', {
                    url: '/posts/{id}',
                    templateUrl: '/posts.html',
                    controller: 'PostsCtrl'
                });

            $urlRouterProvider.otherwise('home');
        }
    ])
    .factory('posts', [function() {
        // export an object from factory that has an array property "posts"
        // this allows us to add extra properties onto o in the future
        var o = {
            posts: []
        };
        return o;
    }])
    .controller('MainCtrl', [
        '$scope',
        'posts',
        function($scope, posts){
            // this is a sort of controller + model
            // it contains data (eg model) and methods to manipulate data (eg controller)
            // and then the template/view in the html takes the methods and builds the view
            // and everything is nicely linked up...

            $scope.posts = posts.posts; // bind posts to $scope
                                        // any changes to $scope.posts will be reflected in the service
                                        // and visible to other controllers using the service.

            // make sure to push, and not re-assign the array like I was doing...
            // keep it by reference so all controllers work on the same data
            $scope.posts.push(
                {
                    title: 'Awesome post!',
                    upvotes: 5,
                    link: 'http://google.com',
                    comments: [
                        {author: 'Michael', body: 'Wow so cool!', upvotes: 2},
                        {author: 'Henry', body: 'What gr8 names', upvotes: 5}
                    ]
                }
            );

            $scope.addPost = function() {
                if (!$scope.title || $scope.title === '') { return; }
                $scope.posts.push({
                    title: $scope.title,
                    link: $scope.link,
                    upvotes: 0,
                    comments: [
                        {author: 'Michael', body: 'Wow so cool!', upvotes: 2},
                        {author: 'Henry', body: 'What gr8 names', upvotes: 5}
                    ]
                });
                $scope.title = '';
                $scope.link = '';
            };

            $scope.incrementUpvotes = function(post) {
                post.upvotes += 1;
            };
        }])
    .controller('PostsCtrl', [
        '$scope',
        '$stateParams',
        'posts',
        function($scope, $stateParams, posts) {
            // add post to our 2-way-data-binding object ($scope)
            // retrieve it through the posts factory, via an id accessible through $stateParams
            $scope.post = posts.posts[$stateParams.id]

            $scope.addComment = function() {
                if ($scope.body === '') { return; }
                console.log("hello: "+$scope.post);
                $scope.post.comments.push({
                    body: $scope.body,
                    author: 'user',
                    upvotes: 0
                });
                $scope.body = '';
            }
        }
    ]);

