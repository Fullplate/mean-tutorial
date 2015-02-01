angular.module('flapperNews', ['ui.router'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl',
                    // resolve: before 'home' state is entered, use 'posts' factory's .getAll() method
                    // results are located in the controller's injected/shared 'posts' object
                    // https://github.com/angular-ui/ui-router/wiki#resolve
                    resolve: {
                        postPromise: ['posts', function(posts) {
                            return posts.getAll();
                        }]
                    }
                })
                .state('posts', {
                    url: '/posts/{id}',
                    templateUrl: '/posts.html',
                    controller: 'PostsCtrl',
                    resolve: {
                        // retrieve 'post' object for controller before rendering /posts/{id}
                        post: ['$stateParams', 'posts', function($stateParams, posts) {
                            return posts.get($stateParams.id);
                        }]
                    }
                });

            $urlRouterProvider.otherwise('home');
        }
    ])
    .factory('posts', ['$http', function($http) {
        // return object 'o', with 'posts' array and a method to update it
        var o = {
            posts: []
        };

        /* GET /posts */
        o.getAll = function() {
            return $http.get('/posts').success(function(data) {
                angular.copy(data, o.posts); // .copy function updates ui appropriately
            });
        };

        /* POST /posts */
        o.create = function(post) {
            return $http.post('/posts', post).success(function(data) {
                o.posts.push(data);
            });
        };

        /* PUT /posts/:post/upvote */
        o.upvote = function(post) {
            return $http.put('/posts/' + post._id + '/upvote')
                .success(function(data) {
                    post.upvotes += 1; // use techniques like this so we don't retrieve entire post again
                });
        };

        /* PUT /posts/:post/downvote */
        o.downvote = function(post) {
            return $http.put('/posts/' + post._id + '/downvote')
                .success(function(data) {
                    post.upvotes -=1;
                });
        };

        /* GET /posts/:post */
        o.get = function(id) {
            // using .then(function...) creates a promise
            return $http.get('/posts/' + id).then(function(res) {
                return res.data;
            });
        };

        /* POST /posts/:post/comments */
        o.addComment = function(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };

        /* PUT /posts/:post/comments/:comment/upvote */
        o.upvoteComment = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
                .success(function(data) {
                    comment.upvotes += 1;
                });
        };

        /* PUT /posts/:post/comments/:comment/downvote */
        o.downvoteComment = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote')
                .success(function(data) {
                    comment.upvotes -= 1;
                });
        };

        return o;
    }])
    .controller('MainCtrl', [ // defined with name, [injected object, ..., handler function(injected object, ...)]
        '$scope',
        'posts',
        function($scope, posts){
            $scope.posts = posts.posts; // bind posts to $scope
                                        // any changes to $scope.posts will be reflected in the service
                                        // and visible to other controllers using the service.

            // adding functions to $scope will make them accessible through our html view
            $scope.addPost = function() {
                if (!$scope.title || $scope.title === '') { return; }
                posts.create({
                    title: $scope.title,
                    link: $scope.link
                });
                $scope.title = '';
                $scope.link = '';
            };

            $scope.incrementUpvotes = function(post) {
                posts.upvote(post);
            };

            $scope.decrementUpvotes = function(post) {
                posts.downvote(post);
            };
        }])
    .controller('PostsCtrl', [
        '$scope',
        'posts',
        'post', // post is injected via the 'resolve' in our url routing
        function($scope, posts, post) {
            $scope.post = post; // add post to our 2-way-binding so it's accessible in view
                                // and any changes we make to it appear immediately

            $scope.commentUiVisible = false;

            $scope.showNewCommentUi = function() {
                $scope.commentUiVisible = true;
            };

            $scope.hideNewCommentUi = function() {
                $scope.commentUiVisible = false;
            };

            $scope.addComment = function() {
                if ($scope.body === '') { return; }
                posts.addComment(post._id, {
                    body: $scope.body,
                    author: $scope.author || "anon"
                }).success(function(comment) {
                    $scope.post.comments.push(comment);
                });
                $scope.body = '';
            };

            $scope.incrementUpvotes = function(comment) {
                posts.upvoteComment(post, comment);
            };

            $scope.decrementUpvotes = function(comment) {
                posts.downvoteComment(post, comment);
            };
        }
    ]);

