/*
 The MIT License (MIT)

 Copyright (c) 2016 Iman Khaghani Far

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */


window.Gstrap = {}; // define g
Gstrap.framework = {
  version: 0.40,
  description: "Mini modular single page Javascript framework built on top of jQuery and EJS.co",
  developer: "Iman Khaghani Far",
  contact: "iman.khaghani@gmail.com",
  license: "MIT",
  repository: "https://github.com/imana97/gstrap"
};
/**
 * Gstrap app builder builds the application
 * @param app
 * @returns {boolean}
 * @constructor
 */
Gstrap.App = function (app) {
  var self = this; // reference to main this

  // check if jquery exist.
  if (typeof ($) === "undefined") {
    throw new Error("Please include jQuery 2 or above in your index.html file.");
  }

  if (typeof(ejs) === "undefined") {
    throw new Error("Please include EJS library from 'http://ejs.co/' to your index.html file.");
  }

  if (typeof (app.compile)=="undefined"){
    app.compile=false;
  }

  /*

   PRIVATE PROPERTIES

   */


  var _routes = []; // list of all routes and callbacks


  /*

   PUBLIC PROPERTIES

   */
  this.modules = {}; // module container. All added modules will be held here with their name as key

  /*

   PRIVATE METHODS

   */


  /**
   * template update provide methods to update the template in the controller
   * @param template pass the template string
   * @private
   */
  var _TemplateUpdate = function (template) {
    var _template = template;
    var _templateDOM = $('<div>').html(_template);
    var _getSubTemplate = function (id) {
      return _templateDOM.find('#' + id).html().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    };


    this.getTemplateString = function () {
      return _template;
    };

    this.getSubTemplateString = function (parentId) {
      return _getSubTemplate(parentId);
    };

    this.update = function (parentId, data) {
      $('#' + parentId).html(ejs.render(_getSubTemplate(parentId), data));
      return this;
    };

    this.append = function (parentId, data) {

      $('#' + parentId).append(ejs.render(_getSubTemplate(parentId), data));
      return this;
    };

    this.prepend=function (parentId, data) {
      $('#' + parentId).prepend(ejs.render(_getSubTemplate(parentId), data));
      return this;
    };

    this.remove = function (parentId, childId) {
      $('#' + parentId).find('#' + childId).remove();
      return this;
    };

  };

  /**
   * Route accepts a path that appends to # and register a callback to that route.
   * Hence, every time the address bar value changes, the route listener goes through
   * all of the registered routes and fire the callback if the route is registered.
   * @param path the path for the callback
   * @param callback the callback function to fire when the path matched. the fired callback
   * has two parameters, the req, containing path, and parameters and the $g object
   * @private
   */
  var _route = function (path, callback) {
    // array containing the path after the # split by '/'
    var hashArr = window.location.hash.slice(3).split('/');
    var pathArr = path.split('/');
    var req = {
      path: path,
      params: {}
    };
    if (hashArr.length == pathArr.length) {
      var check = true;
      $.each(pathArr, function (p, path) {
        if (path.substr(0, 1) == ":") {
          req.params[path.slice(1)] = hashArr[p];
        } else {
          if (path != hashArr[p]) {
            check = false;
          }
        }
      });
      if (check) {
        /**
         * In the callback, we pass two objects.
         * - req
         * -- path: the current path
         * -- params: if the path contains parameters starting with :
         * - self
         * -- self is gstrap instance. You can call it res and then render EJS with it, such as res.render(...)
         */
        callback(req, self);
        return true;
      } else {
        return false;
      }
    }
  };


  /**
   * _listen register all of the routes to the route change listener
   * @private
   */
  var _listen = function () {
    var routeNotFoundCounter = 0;
    $.each(_routes, function (r, ro) {
      if (!_route(ro.path, ro.callback)) routeNotFoundCounter++;
    });
    if (_routes.length == routeNotFoundCounter) {
      self.page.html(_errorTemplate(404, 'Page not found!'));
    }
    window.onhashchange = function () {

      var routeNotFoundCounter = 0;
      $.each(_routes, function (r, ro) {
        if (!_route(ro.path, ro.callback)) routeNotFoundCounter++;
      });
      // if route was not found in any of the registered routes, redirect to route not found
      if (_routes.length == routeNotFoundCounter) {
        self.page.html(_errorTemplate(404, 'Page not found!'));
      }

    }
  };

  /**
   * adding new routes
   * @param path path of the route
   * @param callback the callback to be called when the route is triggered by route listener.
   * @private
   */
  var _addRoute = function (path, callback) {
    _routes.push({path: path, callback: callback});
  };

  /**
   * this function will register all of the listeners after the beforeload was fired.
   * @private
   */
  var _loadApp = function () {
    app.beforeLoad(self, function () {
      //before load is loaded
      _loadModulesRoutes();
      // load the user defined load
      app.load(self);
      // listen to all routes
      _listen();
    });
  };


  /**
   * this function add all of the routes found in the loaded modules
   * @private
   */
  var _loadModulesRoutes = function () {
    for (var m in self.modules) {
      if (typeof(self.modules[m].routes) !== "undefined") {
        var routes = self.modules[m].routes;
        for (var r in routes) {
          _addRoute(routes[r].route, routes[r].callback);
        }
      }
    }
  };

  /**
   * make sure the path or route ends with '/'
   * @param path the path to check and fix
   * @returns {string} fixed path
   * @private
   */
  var _pathfix = function (path) {
    return (path.length != 0) ? path.search(/\/$/) == -1 ? path + '/' : path : path;
  };

  /**
   * generate HTML error
   * @param code
   * @param message
   * @returns {string}
   * @private
   */
  var _errorTemplate = function (code, message) {
    return '<div class="panel panel-danger">' +
      '<div class="panel-heading">' +
      'Error ' + code +
      '</div>' +
      '<div class="panel-body">' +
      message +
      '</div>' +
      '</div>'
  };
  /*

   PUBLIC METHODS

   */


  /**
   * returns the name of the application
   * @returns {string} appName
   */
  this.getAppName = function () {
    return app.name;
  };

  /**
   * returns the version of the app
   * @returns {number} appVersion
   */
  this.getAppVersion = function () {
    return app.version;
  };

  /**
   * returns description of the app
   * @returns {string}
   */
  this.getAppDescription = function () {
    return app.description;
  };

  /**
   * here we create the main container
   * @type {any}
   */
  this.container = $(document.createElement('div')).addClass('container');
  $(function () {
    $('body').append(self.container);
  });

  /**
   * page is the dynamic sub container that changes as route changes
   * @type {any}
   */
  this.page = $(document.createElement('div')).addClass('container');

  /**
   * static does is a sub container in the main container that does not change by route change
   * @param static
   */
  this.appendStatic = function (s) {
    this.container.append(s);
  };

  /**
   * append dynamic set the location of view that changes according to the hash change
   * @param val
   */
  this.appendDynamic = function (val) {
    if (val) {
      this.page.html(val);
    }
    this.container.append(this.page);
  };

  /**
   * apped a footer to the body
   * @param val
   */
  this.appendFooter = function (val) {
    $('body').append(val);
  };

  /**
   * ajax queue Class
   * @param baseUrl
   * @constructor
   */
  this.Queue = function (baseUrl) {
    var self = this;
    self.path = baseUrl || "#";
    self.queue = [];
    self.lastData = null;
    self.next = function (func) {
      self.queue.push(func);
      return self;
    };
    self.callback = function () {
      self.queue.shift();
      if (self.queue.length > 0) {
        _runArray(self.queue[0]);
      }
    };
    var _getParamNames = function (func) {
      var funStr = func.toString();
      var arr = funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^s,]+)/g);
      return (arr == null);
    };
    var _runArray = function (func) {
      _getParamNames(func) ? func() : func(self.callback);
    };
    self.run = function () {
      if (self.queue.length > 0) {
        _runArray(self.queue[0]);
      }
    };
  };

  /**
   * Renders EJS to the dynamic view and
   * @param path the path to the EJS template
   * @param data data to be sent to the EJS template
   * @param callback returns a function that can be used to control the rendered template after it is loaded in the dynamic view.
   */
  this.render = function (path, data, callback) {
    var data = data || {};
    var callback = callback || function (view) {
      };
    try {
      var renderer=path.split('.')[1];

      $.ajax({
        url: path,
        dataType: "text",
        success: function (string) {
          /**
           * we need str to use for template update.
           * it should be available inside of the controller
           */
          var template = string;
          if (renderer=='ejs'){
            self.page.html(ejs.render(string, data));
            callback(new _TemplateUpdate(template));
          } else if (renderer=='mustache'){
            self.page.html(Mustache.render(string, data));
            callback(new _TemplateUpdate(template));
          } else{
            throw new Error("Template is not recognised. Make sure it has the 'ejs' or 'mustache' extension");
          }
        }
      });

    } catch (e){
      throw new Error("Template must have either 'mustache' or 'ejs' extension.");
    }


  };

  this.error = function (error) {
    if (!error) throw new Error('Error message can not be empty');

    var message = "Page was not Found";
    var code = 404;

    if (error.message) {
      message = error.message;
    }
    ;

    if (error.code) {
      code = error.code;
    }

    self.page.html(_errorTemplate(code, message));
  };

  this.redirect = function (path) {
    if (!path) {
      throw new Error('Redirect path is not specified');
    }
    window.location.href = '#!/' + _pathfix(path);
  };

  /**
   * simply render a templace with the specified data and return the rendered html in a callback. This method is used when the desired rendered
   * html should not be appended to the dymanic view.
   * @param path the path to the EJS template
   * @param data data to be rendered in the EJS
   * @param callback callback with the rendered html as parameter.
   * @constructor
   */
  this.EJS = function (path, data, callback) {
    $.ajax({
      url: path,
      dataType: "text",
      success: function (string) {
        // callback sends the rendered html which can be appended to the html at a custom place.
        callback(ejs.render(string, data));
      }
    });
  };

  /**
   * return registered routes.
   * @returns {Array}
   */
  this.getRoutes = function () {
    return _routes;
  };

  /**
   * If beforeload is not called, then define before load.
   */
  if (!app.beforeLoad) {
    app.beforeLoad = function ($s, next) {
      next();
    }
  }

  /**
   * dep loader loads all of the modules required for the app before anything happens. After all modules loaded successfully, deploader
   * will load the app.
   * @param modules
   * @private
   */
  var _depLoader = function (modules) {
    if (modules.length == 0) {
      _loadApp();
    } else {
      $.ajax({
        url: modules[0].path,
        dataType: "text",
        success: function (data) {
          try{
            if (modules[0].type=="module") {
              self.modules[modules[0].name] = eval(data);
            }
          } catch (e){
            throw new Error("Module "+modules[0].name+": "+e.message);
          } finally {
            // goto next module
            modules.shift();
            _depLoader(modules);
          }
        }
      });
    }
  };

  if (app.modules) {
    // load the modules

    _depLoader(app.modules);

  } else {
    throw new Error("Modules are not defined");
  }
};

/**
 * Class for creating new modules with registering route listeners
 * @param prefx prefix for the routes registered in this module
 * @constructor
 */
Gstrap.Route = function (prefix) {
  var _prefix;

  var _pathfix = function (path) {
    return (path.length != 0) ? path.search(/\/$/) == -1 ? path + '/' : path : path;
  };

  (prefix) ? _prefix = _pathfix(prefix) : _prefix = "";

  //console.log(_prefix);

  var _routes = [];
  this.on = function (route, callback) {
    _routes.push({
      route: _prefix + _pathfix(route),
      callback: callback
    });
    return this;
  };

  this.listen = function () {
    return {routes: _routes};
  };
};