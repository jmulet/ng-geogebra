/* 
 * 
 * ng-geogebra
 * GEOGEBRA FOR ANGULARJS APPLICATIONS
 * J. Mulet (2015) pep.mulet@gmail.com
 */

require.config({
    paths: {
      'angular' : 'js/libs/angular.js/angular',
      'ng_geogebra': 'js/ng-geogebra'      
    },
    shim: {      
        ng_geogebra: {deps: ['angular']}
    },
    baseUrl: ''
});


require(['angular', 'ng_geogebra'], function () {   
  
  
  var app_sample = angular.module('ng-geogebra-sample', ['ng-geogebra']);
  
  app_sample.controller('ng-geogebra-sample-ctrl', function($scope){
      
      $scope.logger = [];
      $scope.logger.push("Geogebra sample application");
      $scope.dynamicApplets = [];
      
      $scope.getPNG = function(){
            $scope.logger.push($scope.staticApplet1.getPNGBase64());
      };
      
      $scope.staticApplet1 = {
          "cmds": [{"method":"evalCommand", args:["r: x+y=0"]}]
      };
      
      //Create a new applet dynamically
      $scope.newApplet = function(){           
            var applet = {
              onLoad: function(ggb){
                    $scope.logger.push("Dynamical applet has been loaded! Plotting a random circle");
                    var x0 = Math.floor(Math.random()*10-5);
                    var y0 = Math.floor(Math.random()*10-5);
                    var r = Math.floor(Math.random()*5+1);
                    var circle = "(x-("+x0+"))^2+(y-("+y0+"))^2=1";
                    ggb.evalCommand("c: "+circle);
                    $scope.$apply();
              }            
            };
            $scope.dynamicApplets.push(applet);
      };
      
      //Remove applet
      $scope.removeApplet = function(applet){
            var idx = $scope.dynamicApplets.indexOf(applet);
            if(idx>=0)
            {
                $scope.dynamicApplets.splice(idx,1);
            }
      };
      
  });
  
  //Manually bootstrap the ng app
  angular.bootstrap(document, ['ng-geogebra-sample']);
  
});
