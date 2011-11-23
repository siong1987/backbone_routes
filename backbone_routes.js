(function() {
  // Backbone.Routes
  // ---------------

  // This is actually like the Rails config/routes.rb. You set all your routes here.
  Backbone.Routes = {
    // To set the prefix of the Routers
    prefix: window,

    map: function(options) {
      options || (options = {});
      _.each(options, function(routers, route) {
        _.each(routers, function(name, router) {
          var newRouter = new Backbone.Routes.prefix[router]();
          newRouter.route(route, name, newRouter[name]);
        });
      });
    }
  };

  _.extend(Backbone.Router.prototype, Backbone.Events, {
    // Make _bindRoutes useless
    _bindRoutes : function() {}
  });

  _.extend(Backbone.History.prototype, {
    route : function(route, callback) {
      _.any(this.handlers, function(handler) {
        if (handler.route.toString() == route.toString()) {
          handler.callbacks.push(callback);
          return;
        }
      });
      this.handlers.push({route : route, callbacks : [callback]});
    },

    loadUrl : function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      // To keep track of called routers, to prevent problem like, in one router:
      // "/new" < get called
      // "/:id" < get called
      // Now, there is only one action in one particular router gets called.
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          _.each(handler.callbacks, function(callback) {
            callback(fragment);
          });
          return true;
        }
      });
      return matched;
    }
  });
}).call(this);

