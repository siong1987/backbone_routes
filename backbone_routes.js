(function() {
  // Backbone.Routes
  // ---------------

  // This is actually like the Rails config/routes.rb. You set all your routes here.
  Backbone.Routes = {
    // To set the prefix of the Routers
    prefix: window,
    cachedCallbacks: [],
    cachedActions: [],

    map: function(options) {
      var cachedRouters = {};
      options || (options = {});
      _.each(options, function(routers, route) {
        _.each(routers, function(action_name, router) {
          var newRouter = cachedRouters[router];
          if (typeof(newRouter) === "undefined") {
            newRouter = new Backbone.Routes.prefix[router]();
            // Stores all the cached actions
            if (newRouter.cache) {
              _.each(newRouter.cache, function(name) {
                Backbone.Routes.cachedActions.push(router+"#"+name);
              });
            }
            cachedRouters[router] = newRouter;
          }
          newRouter.route(route, action_name, newRouter[action_name]);
        });
      });
    }
  };

  _.extend(Backbone.Router.prototype, Backbone.Events, {
    route : function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      var action = _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
      }, this);
      var route_name = this.constructor.name + "#" + name;
      Backbone.history.route(route_name, route, action);
    },

    // Make _bindRoutes useless
    _bindRoutes : function() {}
  });

  _.extend(Backbone.History.prototype, {
    route : function(route_name, route, callback) {
      _.any(this.handlers, function(handler) {
        if (handler.route.toString() == route.toString()) {
          handler.callbacks.push(callback);
          handler.names.push(route_name);
          return;
        }
      });
      this.handlers.push({route : route, callbacks : [callback], names : [route_name]});
    },

    loadUrl : function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      // To keep track of called routers, to prevent problem like, in one router:
      // "/new" < get called
      // "/:id" < get called
      // Now, there is only one action in one particular router gets called.
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          _.each(handler.callbacks, function(callback, index) {
            if (!_.include(Backbone.Routes.cachedCallbacks, handler.names[index])) {
              callback(fragment);
            }
          });
          Backbone.Routes.cachedCallbacks = _.intersection(handler.names, Backbone.Routes.cachedActions);
          return true;
        }
      });
      return matched;
    }
  });
}).call(this);

