(function(){
    angular
        .module('app',[
             "ui.router",
            "ui.bootstrap",
            "ui.select",
            'gantt', 'gantt.tree', 'gantt.groups', 'gantt.table', 'gantt.progress', 'gantt.movable', 'gantt.tooltips'
        ])
        .controller('GanttCtrl',GanttCtrl)
    //解决跨域问题
        .config([
            '$httpProvider', '$locationProvider', '$interpolateProvider', '$urlMatcherFactoryProvider',
            function ($httpProvider, $locationProvider, $interpolateProvider, $urlMatcherFactoryProvider) {
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
                $httpProvider.defaults.xsrfCookieName = 'csrftoken';
                $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';


                function valToString(val) {
                    return val !== null ? val.toString() : val;
                }

                $urlMatcherFactoryProvider.type('nonURIEncoded', {
                    encode: valToString,
                    decode: valToString,
                    is: function () {
                        return true;
                    }
                });
            }
        ]);


    GanttCtrl.$inject = ['$scope', '$stateParams', '$state', '$http'];

    function GanttCtrl($scope, $stateParams, $state, $http) {


        $http({
            url:'http://172.29.16.103:8123/api/account/user/signin/',
            method:'POST',
            data:{
               username:'test00012',password:'test00012'
            }
        }).then(function(response){});


        var params = angular.copy($stateParams);
        var projectID = params['id'];
        delete params['id'];
        params['scale'] = "day";
        $scope.gantt = {params: params, loading: true};
        $scope.options = {
            columnsHeaderContents: {
                'model.name': ''
            },
            currentDate: 'line',
            sortMode:'',
            api: function (api) {
                $scope.api = api;
                api.core.on.ready($scope, function () {
                    api.directives.on.new($scope, function (directiveName, directiveScope, element) {
                        if (directiveName === 'ganttRowLabel') {
                            element.bind('click', function (event) {
                                $state.go('^.issues.detail', {issueId: directiveScope.row.model.id})
                            })
                        }
                    });
                })
            }
        };

        $scope.expandAll = function(){
            $scope.api.tree.expandAll();
        };
        $scope.collapseAll = function(){
          $scope.api.tree.collapseAll();
        };

        var params2 = angular.copy($scope.gantt.params);
        delete params2['end_date'];
        delete params2['start_date'];
        getIssues(params2);

        function getIssues(params2){
            $http.get('http://172.29.16.103:8123/v2/project/' + 95 + '/issue/gantt/',{params:params2}).then(function (response) {
                var data = response.data;
                if(params2.executor == null && params2.state == null && !data.length){
                    $scope.flag = false
                }
                else
                {
                    $scope.flag = true
                }
                for (var i = 0; i < data.length; i++) {
                    if (data[i].tasks) {
                        if (data[i].tasks[0].progress < 100 && new Date(data[i].tasks[0].to) < new Date()) {
                            data[i].tasks[0].color = "red"
                        }
                        else if (data[i].tasks[0].state == 'open') {
                            data[i].tasks[0].color = "rgb(1, 152, 117)"
                        }
                        else if(data[i].tasks[0].state == 'closed'){
                            data[i].tasks[0].color = "rgb(217, 83, 79)"
                        }
                        else if(data[i].tasks[0].state == 'new'){
                            data[i].tasks[0].color = "rgb(149, 165, 166)"
                        }
                        else if(data[i].tasks[0].state == 'success'){
                            data[i].tasks[0].color = "rgb(243, 194, 0)"
                        }
                        else{
                            data[i].tasks[0].color = "black"
                        }
                    }
            }
            $scope.gantt['data'] = data;
            $scope.gantt['loading'] = false;
        });

        }

        $scope.reset = function () {
            $scope.gantt.params.scale = "day";
            $scope.gantt.params.start_date = null;
            $scope.gantt.params.end_date = null;
            $scope.options.sortMode ='';
            $scope.expandAll();
            var clear_params = {start_date: null, end_date: null, executor: null, state: null};
            getIssues(clear_params);
        };
        $scope.filter = function (params) {
            params['start_date'] = params['start_date'] ? moment(params['start_date']).format("YYYY-MM-DD") : null;
            params['end_date'] = params['end_date'] ? moment(params['end_date']).format("YYYY-MM-DD") : null;
            getIssues(params);
        }
    }
})();
