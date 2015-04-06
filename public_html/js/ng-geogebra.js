/* 
 * 
 * ng-geogebra
 * GEOGEBRA FOR ANGULARJS APPLICATIONS
 * J. Mulet (2015) pep.mulet@gmail.com
 */


var ng_ggb = angular.module('ng-geogebra', []);

ng_ggb.directive('geogebra', ['$window', '$timeout', function($window, $timeout){
   'use strict';
   return {
            restrict: 'A',
            scope: { model: "=ngModel", geogebra: "@geogebra"},
            link: function (scope, element, attrs) {
                
                 
                var GEOGEBRA_ROOT = 'https://tube.geogebra.org/';  
                
                var deps = [//GEOGEBRA_ROOT+'scripts/worksheet/general.js',
                            GEOGEBRA_ROOT+'scripts/deployggb.js',
                            GEOGEBRA_ROOT+'files/appComp/shared/min.js',
                            GEOGEBRA_ROOT+'files/appComp/shared/mathquillggb.js'];
                        
                    require(deps, function(){
                         
                        var currentLang = 'en';
                        //Start with an empty scene
                        var base64 = null;
                        
                        if(attrs.base64){
                            base64 = attrs.base64;
                        };
                        
                        if(scope.model && scope.model.base64){
                            base64 = scope.model.base64;
                        };
                        
                        var rnd = Math.floor(Math.random()*100000000);
                        var appletID = "ggbApplet"+rnd;
                        
                        var width = 400;
                        var height = 275;
                        
                        if(attrs.width)
                        {
                            width = attrs.width;
                        }
                        else
                        {
                            element.attr("width", width);
                        }
                        
                        if(attrs.height)
                        {
                            height = attrs.height;
                        }
                        else
                        {
                            element.attr("height", height);
                        }
                        
                       
                        //Valid perspectives: 1 AlgebraAndGraphics, 2 Geometry, 3 CAS, 4 Spreadsheet, 5 3DGraphics, 6 Probability, CreateYourOwn
                        var parameters = {"id": appletID, "width": width, "height": height, "showToolBar": false, "showMenuBar": false, "showAlgebraInput": false, 
                            "showResetIcon": true, "enableLabelDrags": true, "enableShiftDragZoom": true, "enableRightClick": false, "showToolBarHelp": false, 
                            "errorDialogsActive": true, "useBrowserForJS": false, "language": currentLang, "isPreloader": false, 
                            "screenshotGenerator": false, "preventFocus": false, "fixApplet": false, "base64": base64, "prerelease": false, "lf":"modern", "app":true,
                            "perspective": 2};
                       
                        
                        //Override parameters with parameters attribute
                        if(attrs.parameters)
                        {
                            try{
                                var parametersJSON = JSON.parse(attrs.parameters);
                                for(var e in parametersJSON)
                                {
                                    parameters[e] = parametersJSON[e];
                                }
                            }
                            catch(e)
                            {
                                 console.log("Geogebra directive parse error: "+e);
                            }
                            
                        }
                        
                        //Override parameters with those from model  
                        if(scope.model && scope.model.parameters)
                        {
                            for(var key in scope.model.parameters)
                            {
                                parameters[key] = scope.model.parameters[key];
                            }
                        }
                        
                          
                        parameters.appletOnLoad = function () {
                            var ggbApplet = document[appletID];
                            scope.model.ggbApplet = ggbApplet;
                            
                            scope.model.getPNGBase64 = function(){
                                return ggbApplet.getPNGBase64(1, true, 72);
                            };
                            
                            scope.model.getBase64 = function(){
                                return ggbApplet.getBase64();
                            };
                            
                            ggbApplet.evalCommand("ZoomIn[-10,-10,10,10]");
                            ggbApplet.setGridVisible(true);
                            
                            //This must be after setGridVisible
                            ggbApplet.setAxesVisible(true, true);
                            ggbApplet.refreshViews();
                            
                            console.log(ggbApplet);
                            
                            
                            if(scope.geogebra)
                            {
                                try{
                                    var ggbJSON = JSON.parse(scope.geogebra);
                                    if(ggbJSON)
                                    {
                                        ggbJSON.forEach(function(obj){
                                            var method = ggbApplet[obj.method];
                                            method.apply(ggbApplet, obj.args);                                            
                                        });
                                    }
                                }
                                catch(e){
                                    console.log("Geogebra directive parse error: "+e);
                                };
                            }
                            
                            if(scope.model && scope.model.onLoad)
                            {
                                scope.model.onLoad(ggbApplet);
                            }
                            
                            if(scope.model && scope.model.cmds)
                            {
                                //execute existing cmds and watch for changes
                                  scope.model.cmds.forEach(function(obj){
                                            var method = ggbApplet[obj.method];
                                            method.apply(ggbApplet, obj.args);                                            
                                  });
                            }
                            
                            //if (typeof $ === "function" && window.GGBT_wsf_view !== undefined) {
                            //    var container = $("#applet_container_581411");
                            //    window.GGBT_wsf_view.postProcessApplet(container);
                            //}

                        };
                        /** is3D=is 3D applet using 3D view, AV=Algebra View, SV=Spreadsheet View, CV=CAS View, EV2=Graphics View 2, CP=Construction Protocol,
                         *   PC=Probability Calculator, DA=Data Analysis, FI=Function Inspector, PV=Python, macro=Macro View */
                        var views = {"is3D": false, "AV": false, "SV": false, "CV": false, "EV2": false, "CP": false, "PC": false,
                            "DA": false, "FI": false, "PV": false, "macro": false};
                        
                        
                        //Override views with parameters attribute
                        if(attrs.views)
                        {
                            try{
                                var viewsJSON = JSON.parse(attrs.views);
                                for(var e in viewsJSON)
                                {
                                    //console.log("set "+e+" to "+viewsJSON[e]);
                                    views[e] = viewsJSON[e];
                                }
                            }
                            catch(e)
                            {
                                 console.log("Geogebra directive parse error: "+e);
                            }
                            
                        }
                        
                        if(scope.model && scope.model.views)
                        {
                            for(var key in scope.model.views)
                            {
                                views[key] = scope.model.views[key];
                            }
                        }
                        
                        var version = "5.0" 
                        var applet = new GGBApplet(version, parameters, views);
                        
                        applet.setJavaCodebaseVersion(version);
                        applet.setHTML5CodebaseVersion(version);
                        applet.setHTML5Codebase('http://www.geogebra.org/web/'+version+'/web3d/', true);
                        //applet.setJNLPFile('www.geogebratube.org/webstart/"+version+"/applet50_web.jnlp');
                        applet.setJNLPBaseDir('https://tube.geogebra.org/webstart/');
                        //applet.setPreviewImage('https://tube.geogebra.org/files/00/00/58/14/material-581411.png?v=1427959990', 
                        //                      'https://tube.geogebra.org/images/GeoGebra_loading.png?v=1427976809');
                        applet.setGiacJSURL('https://tube.geogebra.org/webstart/4.4/giac.js');
    
                        var containerID = element.attr('id');
                        if(!containerID)
                        {
                            containerID = "ggbContainer"+rnd;
                            element.attr('id', containerID);
                        }
                         
                         
                        element.ready(function(){
                           
                            applet.inject(containerID, 'auto');
                            
                        });
                        
                        /*element.on('$destroy', function(){
                              //container has been removed from DOM, get rid of applet
                             applet.removeExistingApplet(containerID, false);
                             applet = null;                             
                        });*/
                         
                     });
              
        }
    };
    
}]);
        
 