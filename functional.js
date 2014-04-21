(function(__hostObject__, __namespace__) {
  var __original__ = __hostObject__[__namespace__], _ = {};
  __hostObject__[__namespace__] = _;

  _.noop = (_.id = function(x) {
    return x;
  }).bind(_, undefined);

  _.curried = function (cb) {
    return function(x) {
      return cb.length > 1 ? _.curried(cb.bind(this, x)) : cb.call(this, x);
    };
  };

  _.step = function(memo, functor) {
    return functor(memo);
  };

  _.proc = function() {
    return [].reduce.bind(arguments, _.step);
  };

  _.ternary = function(cond, yes, no) {
    return _.splat(function(args) {
      return (cond.apply(this, args) ? yes : no || _.noop).apply(this, args);
    });
  };

  _.wrapper = _.curried(function(extra, cb) {
    return _.splat(function(args) {
      return extra.call(this, cb.apply(this, args));
    });
  });

  _.bang = function(x) {
    return !x;
  };
  _.not = _.wrapper(_.bang);

  function plus(x, y) {
    return x + y;
  }
  
  function times(x, y) {
    return x * y;
  }

  _.splat = function(cb) {
    return function() {
      var use = [].slice.call(arguments),
        split = cb.length-1,
        args = use.slice(0, split);
        args.push(use.slice(split));
      return cb.apply(this, args);
    };
  };

  _._ = _.curried;
  _.mult = _._(times);

  _.add = _._(plus);

  _.div = _._(function(x, y) {
    return y / x;
  });

  _.sub = _._(function(x, y) {
    return y - x;
  });

  _.mod = _._(function(x, y) {
    return y % x;
  });

  _.gte = _._(function(x, y) {
    return y >= x;
  });

  _.gt = _._(function(x, y) {
    return y > x;
  });

  _.lte = _._(function(x, y) {
    return y <= x;
  });

  _.lt = _._(function(x, y) {
    return y < x;
  });

  _.is = _._(function(x, y) {
    return y === x;
  });

  _._ = undefined;

  _.negate = _.mult(-1);
  _.even = _.not(_.mod(2));
  _.odd = _.not(_.even);

  _.functional = _.lambda = function(method) {
    return _.splat(function (args){
      return function (object){
        return (typeof method === 'string' ? object[method] : method)
          .apply(object, args);
      };
    });
  };

  _.reduce = _.lambda('reduce');
  _.sum = _.reduce(plus, 0);
  _.prod = _.reduce(times, 1);
  _.filter = _.proc(_.not, _.lambda('filter'));
  _.some = _.any = _.lambda('some');
  _.each = _.forEach = _.lambda('forEach');
  _.reverse = _.lambda('reverse')();
  _.keys = Object.keys;
  _.none = _.not(_.any);

  _.find = _.curried(function(cb, array) {
    var ii = 0, len = array.length;
    for (; ii < len; ii++)
      if (cb.call(this, array[ii]))
        return array[ii];
  });

  _.type = function(item) {
    return typeof item;
  };



  _.logical = function(exitCase) {
    return _.splat(function(tests) {
      return _.splat(function(args) {
        var val, ii = 0;
        for(; ii < tests.length; val = tests[ii++].apply(this, args))
          if (exitCase(val))
            return val;
        return val;
      });
    });
  };

  _.or = _.logical(_.id);
  _.and = _.logical(_.bang);

  _.sig = _.signature = _.lambda(Object.prototype.toString)();

  _.isA = _.isAn = function(signature) {
    var sig = RegExp(signature);
    return _.wrapper(sig.test)(_.sig).bind(sig);
  };

  _.partial = _.splat(function(cb, args){
    return cb.bind.apply(cb, [,].concat(args));
  });

  _.flatten = Function.prototype.apply.bind([].concat, []);

  _.crush = function(collection) {
    return _.flatten(collection.map(_.ternary(_.isAn('Array'), _.crush, _.id)));
  };

  _.memoize = function(cb, hash, max) {
    var bucket = {}, trace = [];
    max = max || Infinity;
    return _.splat(function(args) {
      var signature = (hash || _.id).apply(null, args);
      if (memo = bucket[signature])
        return memo;
      else {
        trace.push(signature);
        if (trace.length > max)
          delete bucket[trace.shift()];
        return bucket[signature] = cb.apply(null, args);
      }
    });
  };

  _.noConflict = function(newNamespace) {
    __hostObject__[__namespace__] = __original__;
    if (_.isA('String')(newNamespace))
      __hostObject__[__namespace__ = newNamespace] = _;
    return _;
  };

})(this, '_');