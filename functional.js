(function(__hostObject__, __namespace__) {
  // Use strange names in source to prevent collisions
  var __original__ = __hostObject__[__namespace__], _ = {};
  __hostObject__[__namespace__] = _;

  // Build out a noop returning undefined and an identity function
  _.noop = (_.id = function(x) {
    return x;
  }).bind(_, undefined);


  // Allows partial application of N arguments to callback.
  // Returned function is still bindable and callable to set `this`
  _.partial = splat(function(cb, args){
    return cb.bind.apply(cb, [this].concat(args));
  });

  // Turns a function into a curried one.
  // A 3 parameter function can be called 1 argument at a time,
  //   until the third call when it evaluates out.
  // Curry length is based on named parameters.
  _.curried = function (cb) {
    return _.splat(function(args) {
      return cb.length > 1 ? _.curried(_.partial.apply(this, [cb].concat(args))) : cb.apply(this, args);
    });
  };

  // Reverse call a function for use in reduce operations,
  //   or cases in which one wants to define an argument before a function.
  _.step = function(memo, functor) {
    return functor(memo);
  };

  // Acts like a pipe chain.
  // The first function is the input step, then the return value
  //   is passed to the second, and so on, until chain ends and value returned.
  _.proc = function() {
    return [].reduce.bind(arguments, _.step);
  };

  // Higher-order ternary operation.
  // Takes a condition to run on arguments,
  //   then runs and returns the second or third callback depending on
  //   the result of the first.
  _.ternary = function(cond, yes, no) {
    return _.splat(function(args) {
      return (cond.apply(this, args) ? yes : no || _.noop).apply(this, args);
    });
  };

  // Because dealing with raw operators is not functional
  function plus(x, y) {
    return x + y;
  }
  function times(x, y) {
    return x * y;
  }

  // Expose on namespace
  _.splat = splat;

  // Hoisted with statement instead of assignment,
  //   because other functions use it.
  // Generates a Ruby-like splat function.
  // Example: If function has 2 arguments and it processed with splat,
  //   the returned function deleages the first parameter as is,
  //   and builds an Array out of the 2-N arguments
  function splat(cb) {
    return function() {
      var use = [].slice.call(arguments),
        split = Math.max(cb.length-1, 0),
        args = use.slice(0, split);
        args.push(use.slice(split));
      return cb.apply(this, args);
    };
  };

  // High-order generator builds other wrapper and post-application functions.
  _.wrapper = _.curried(function(extra, cb) {
    return _.splat(function(args) {
      return extra.call(this, cb.apply(this, args));
    });
  });

  // Functional quivalent of running !
  _.bang = function(x) {
    return !x;
  };

  // functional negation: _.isOdd => _.isEven (for normal ints)
  _.not = _.wrapper(_.bang);

  // Aliasing for the next block to save on space during heavy invocation
  _._ = _.curried;

  // Allows you to define the X in X*Y, and store as multiplier function.
  _.mult = _._(times);

  // Allows you to define the X in X+Y, and store as addition function.
  _.add = _._(plus);

  // Allows you to define the Y in X/Y, and store as division function.
  _.div = _._(function(x, y) {
    return y / x;
  });

  // Allows you to define the Y in X-Y, and store as subtraction function.
  _.sub = _._(function(x, y) {
    return y - x;
  });

  // Allows you to define the Y in X%Y, and store as modulo function.
  _.mod = _._(function(x, y) {
    return y % x;
  });

  // Generates an "is greater than or equal to" check for static value
  _.gte = _._(function(x, y) {
    return y >= x;
  });

  // Generates an "is greater than" check for static value
  _.gt = _._(function(x, y) {
    return y > x;
  });

  // Generates an "is less than or equal to" check for static value
  _.lte = _._(function(x, y) {
    return y <= x;
  });

  // Generates an "is less than" check for static value
  _.lt = _._(function(x, y) {
    return y < x;
  });

  // Generates a === check for static value
  _.is = _._(function(x, y) {
    return y === x;
  });

  // Remove alias from namespace since we're not heavily using  _.curried now.
  delete _._;

  // Uses prebound multiplier of -1 to negate things
  _.negate = _.mult(-1);

  // Check integer for being even. MUST BE INT.
  _.even = _.not(_.mod(2));

  // Check integer for being odd. MUST BE INT.
  _.odd = _.not(_.even);

  // High-order lambda function generator.
  // Transforms an OOP function, either intance or class, into functional.
  // First call builds functional,
  // Second binds all the arguments,
  // Third and last calls the method on the object as context
  _.functional = _.lambda = function(method) {
    return _.splat(function (args){
      return function (object){
        return (typeof method === 'string' ? object[method] : method)
          .apply(object, args);
      };
    });
  };

  // Set up a ton of functionals using my lamba generator.
  _.reduce = _.lambda('reduce');
  _.sum = _.reduce(plus, 0);
  _.prod = _.reduce(times, 1);
  _.filter = _.proc(_.not, _.lambda('filter'));
  _.some = _.any = _.lambda('some');
  _.each = _.forEach = _.lambda('forEach');
  _.reverse = _.lambda('reverse')();
  _.keys = Object.keys;

  // Equivalent of "none meet callback condition in collection"
  _.none = _.not(_.any);

  // Find function builder
  // First bind the method of search,
  //   then provide collection to search
  _.find = _.curried(function(cb, array) {
    var ii = 0, len = array.length;
    for (; ii < len; ii++)
      if (cb.call(this, array[ii]))
        return array[ii];
  });

  // Functional typof (remember, don't try with uninizialized vars)
  _.type = function(item) {
    return typeof item;
  };


  // Shared code for iterating through functional boolean logic
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

  // Allows supply of several tests to run at once,
  //   builds single function to test with.
  // Behavior is akin to || operator but for functions.
  _.or = _.logical(_.id);

  // Same as above, only functional parity with &&
  _.and = _.logical(_.bang);

  // Short single call to check cross-frame object class signature.
  _.sig = _.signature = _.lambda(Object.prototype.toString)();

  // functional generator for testing object typing.
  // The first call is the name of the 'class' signature to build test
  // The second call returns if that signature matches.
  _.isA = _.isAn = function(signature) {
    var sig = RegExp(signature);
    return _.wrapper(sig.test)(_.sig).bind(sig);
  };

  // One liner to build a single-level array flattener.
  _.flatten = Function.prototype.apply.bind([].concat, []);

  // Recursive flattener.
  _.crush = function(collection) {
    return _.flatten(collection.map(_.ternary(_.isAn('Array'), _.crush, _.id)));
  };

  // Used for idempotent functions.
  // If your function has no side effects (is pure), use this to instantly
  //   build a cached version of it.
  // The required, first argument is the callback to cache
  // Second, optional is the hashing function to use
  //   to build lookups. Defaults to checking equality of 1st argument.
  // Third, state the max size you want the cache to grow to.
  //   Any calls above that number begins flushing old lookups.
  _.memoize = function(cb, hash, max) {
    var bucket = {}, trace = [];
    max = max || Infinity;
    return _.splat(function(args) {
      var signature = (hash || _.id).apply(this, args);
      if (memo = bucket[signature])
        return memo;
      else {
        trace.push(signature);
        if (trace.length > max)
          delete bucket[trace.shift()];
        return bucket[signature] = cb.apply(this, args);
      }
    });
  };

  // Merges properties of a collection of arguments
  _.merged = _.splat(function(objs){
    var host = {};
    objs.forEach(function(obj) {
      _.keys(obj).forEach(function(key) {
        host[key] = obj[key];
      });
    });
    return host;
  });

  // Yields named parameters array for a function.
  _.args = function(callback) {
    return callback.toString().match(/^function \((.*)\)/)[1].split(',').map(_.lambda('trim')());
  };


  // Returns namespace back to original owner,
  //   moves to a new one on the same host if key provided,
  //   and returns reference to the detached/reattached library namespace.
  _.noConflict = function(newNamespace) {
    __hostObject__[__namespace__] = __original__;
    if (_.isA('String')(newNamespace))
      __hostObject__[__namespace__ = newNamespace] = _;
    return _;
  };

})(this, '_');