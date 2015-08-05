(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tevatron = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":5}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":6}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":7}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":8}],5:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":41,"../modules/es6.string.iterator":44,"../modules/web.dom.iterable":45}],6:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$.core').Object.assign;
},{"../../modules/$.core":13,"../../modules/es6.object.assign":43}],7:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":27}],8:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":27}],9:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":21}],10:[function(require,module,exports){
var toObject  = require('./$.to-object')
  , ES5Object = require('./$.es5-object')
  , enumKeys  = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = toObject(target, true)
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$.enum-keys":16,"./$.es5-object":17,"./$.to-object":36}],11:[function(require,module,exports){
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":12,"./$.wks":39}],12:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],13:[function(require,module,exports){
var core = module.exports = {};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],14:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , PROTOTYPE = 'prototype';
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {})[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && typeof target[key] != 'function')exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp[PROTOTYPE] = C[PROTOTYPE];
    }(out);
    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$.core":13,"./$.global":18}],15:[function(require,module,exports){
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],16:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , isEnum     = $.isEnum
    , getSymbols = $.getSymbols;
  if(getSymbols)for(var symbols = getSymbols(it), i = 0, key; symbols.length > i; ){
    if(isEnum.call(it, key = symbols[i++]))keys.push(key);
  }
  return keys;
};
},{"./$":27}],17:[function(require,module,exports){
// fallback for not array-like ES3 strings
var cof     = require('./$.cof')
  , $Object = Object;
module.exports = 0 in $Object('z') ? $Object : function(it){
  return cof(it) == 'String' ? it.split('') : $Object(it);
};
},{"./$.cof":12}],18:[function(require,module,exports){
var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
module.exports = global;
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],19:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],20:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.support-desc') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":27,"./$.property-desc":29,"./$.support-desc":33}],21:[function(require,module,exports){
// http://jsperf.com/core-js-isobject
module.exports = function(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
};
},{}],22:[function(require,module,exports){
// Safari has buggy iterators w/o `next`
module.exports = 'keys' in [] && !('next' in [].keys());
},{}],23:[function(require,module,exports){
'use strict';
var $ = require('./$')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: require('./$.property-desc')(1,next)});
  require('./$.tag')(Constructor, NAME + ' Iterator');
};
},{"./$":27,"./$.hide":20,"./$.property-desc":29,"./$.tag":34,"./$.wks":39}],24:[function(require,module,exports){
'use strict';
var LIBRARY         = require('./$.library')
  , $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , hide            = require('./$.hide')
  , has             = require('./$.has')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , Iterators       = require('./$.iterators')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values';
function returnThis(){ return this; }
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  require('./$.iter-create')(Constructor, NAME, next);
  function createMethod(kind){
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = require('./$').getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    require('./$.tag')(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
  }
  // Define iterator
  if(!LIBRARY || FORCE)hide(proto, SYMBOL_ITERATOR, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * require('./$.iter-buggy'), NAME, methods);
  }
};
},{"./$":27,"./$.def":14,"./$.has":19,"./$.hide":20,"./$.iter-buggy":22,"./$.iter-create":23,"./$.iterators":26,"./$.library":28,"./$.redef":30,"./$.tag":34,"./$.wks":39}],25:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],26:[function(require,module,exports){
module.exports = {};
},{}],27:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],28:[function(require,module,exports){
module.exports = true;
},{}],29:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],30:[function(require,module,exports){
module.exports = require('./$.hide');
},{"./$.hide":20}],31:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":18}],32:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":15,"./$.to-integer":35}],33:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !!function(){
  try {
    return Object.defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
},{}],34:[function(require,module,exports){
var has  = require('./$.has')
  , hide = require('./$.hide')
  , TAG  = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))hide(it, TAG, tag);
};
},{"./$.has":19,"./$.hide":20,"./$.wks":39}],35:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],36:[function(require,module,exports){
var ES5Object = require('./$.es5-object')
  , defined   = require('./$.defined');
module.exports = function(it, realString){
  return (realString ? Object : ES5Object)(defined(it));
};
},{"./$.defined":15,"./$.es5-object":17}],37:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],38:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],39:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || require('./$.uid'))('Symbol.' + name));
};
},{"./$.global":18,"./$.shared":31,"./$.uid":37}],40:[function(require,module,exports){
var global    = require('./$.global')
  , classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  var Symbol = global.Symbol;
  if(it != undefined){
    return it[Symbol && Symbol.iterator || '@@iterator']
      || it[ITERATOR]
      || Iterators[classof(it)];
  }
};
},{"./$.classof":11,"./$.core":13,"./$.global":18,"./$.iterators":26,"./$.wks":39}],41:[function(require,module,exports){
var anObject = require('./$.an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./$.core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./$.an-object":9,"./$.core":13,"./core.get-iterator-method":40}],42:[function(require,module,exports){
var setUnscope = require('./$.unscope')
  , step       = require('./$.iter-step')
  , Iterators  = require('./$.iterators')
  , toObject   = require('./$.to-object');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toObject(iterated); // target
  this._i = 0;                  // next index
  this._k = kind;               // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$.iter-define":24,"./$.iter-step":25,"./$.iterators":26,"./$.to-object":36,"./$.unscope":38}],43:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":10,"./$.def":14}],44:[function(require,module,exports){
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":24,"./$.string-at":32}],45:[function(require,module,exports){
require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
},{"./$.iterators":26,"./es6.array.iterator":42}],46:[function(require,module,exports){
/*!
 * Tevatron v0.1.5
 * by Fast Company
 *
 * Copyright 2015 Mansueto Ventures, LLC and other contributors
 * Released under the MIT license
 *
 */
'use strict';

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = function (prototype) {
    if (prototype) {
        /* global HTMLTemplateElement */
        // Check to see if the template argument is a Template node, or if it's
        // an object from the builder script
        if (prototype.template && prototype.template instanceof HTMLTemplateElement) {
            prototype.template = templateNodeToTemplateObj(prototype.template);
        }

        // If this element is extending a built-in element, make sure it inherits the correct prototype
        if (prototype['extends'] && !prototype.inherits) {
            prototype.inherits = prototype['extends'];
        }

        // Create the element's new prototype
        var newPrototype = createElementPrototype(prototype.template, prototype.createdCallback, prototype.inherits);

        // If there's any CSS in the template, register it
        if (prototype.template && typeof prototype.template.css === 'string') {
            registerStyle(prototype.template.css, prototype.name);
        }

        // Register the prototype as a custom element
        registerElement(newPrototype, prototype.name, prototype['extends']);
    }

    // Convert a template node into html/css objects
    function templateNodeToTemplateObj(node) {
        var obj = {};
        var htmlString = node.innerHTML;

        // Extract style tags from the template node's innerHTML
        var styleTags = htmlString.match(/<style>(.*?)<\/style>/g);
        htmlString = htmlString.replace(/<style>(.*?)<\/style>/g, '');
        var styleString = null;
        if (Array.isArray(styleTags)) {
            styleString = '';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _getIterator(styleTags), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var tag = _step.value;

                    var thisStyle = tag;
                    thisStyle = thisStyle.replace(/<\/?style>/g, '');
                    styleString += thisStyle;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        obj.html = htmlString;
        obj.css = styleString;

        return obj;
    }

    // Create the element prototype
    function createElementPrototype(template, createdCallback, inherits) {
        var basePrototype = HTMLElement.prototype;
        if (inherits) {
            basePrototype = Object.getPrototypeOf(document.createElement(inherits));
        }
        var ElementPrototype = _Object$create(basePrototype);
        // Function to add an immutable property to the ElementPrototype
        function addConstant(name, value) {
            _Object$defineProperty(ElementPrototype, name, {
                value: value,
                enumerable: 'true'
            });
        }

        // Add all properties into the prototype
        _Object$assign(ElementPrototype, prototype);

        if (typeof template === 'function') {
            createdCallback = template;
        }
        if (typeof createdCallback === 'function') {
            addConstant('canonicalCreatedCallback', createdCallback);
        }

        // Set this element's createdCallback to resolve the element's template,
        // and then call its canonical createdCallback
        ElementPrototype.createdCallback = function () {
            // Collide this element's template, or, if it has no template,
            // its base element's template
            if (template && typeof template.html === 'string') {
                collideHTML(template.html, this);
            } else if (inherits && basePrototype.template) {
                collideHTML(basePrototype.template.html, this);
            }
            // Call this element's createdCallback, or, if it has none,
            // its base element's createdCallback
            if (typeof createdCallback === 'function') {
                createdCallback.call(this);
            } else if (inherits && basePrototype.canonicalCreatedCallback) {
                basePrototype.canonicalCreatedCallback.call(this);
            }
        };

        // Reset this element's innerHTML and recollide it with its template
        addConstant('resetInnerHTML', function (newHTML) {
            this.innerHTML = newHTML;
            if (this.template && typeof this.template.html === 'string') {
                collideHTML(this.template.html, this, true);
            }
        });

        // If this element inherits another element, add these methods
        // to refer to the base element's original functions and properties
        if (inherits) {
            addConstant('callOriginalFunction', function (method) {
                return basePrototype[method].call(this);
            });
            addConstant('getOriginalProperty', function (property) {
                return basePrototype[property];
            });
        }

        ElementPrototype.template = template;
        return ElementPrototype;
    }

    // Register a custom element with the document
    function registerElement(elementPrototype, name, extendsElement) {
        // Make sure the tevatron element registry exists
        if (!window.tevatronElements) {
            window.tevatronElements = {};
        }
        // If this element isn't already registered, register it
        if (!window.tevatronElements[name.toUpperCase()]) {
            // If this element is extending a non-custom element
            if (typeof extendsElement === 'string' && extendsElement !== '') {
                document.registerElement(name.toUpperCase(), {
                    prototype: elementPrototype,
                    'extends': extendsElement
                });
            } else {
                window.tevatronElements[name.toUpperCase()] = document.registerElement(name.toUpperCase(), {
                    prototype: elementPrototype
                });
            }
        }
    }

    // Register a custom element's internal style tags by placing them
    // at the top of the <head>
    function registerStyle(styleString, name) {
        var styleTag = document.getElementById('#tevatron-styles-' + name);
        if (styleTag === null) {
            styleTag = document.createElement('style');
            styleTag.id = '#tevatron-styles-' + name;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML += styleString;
    }

    // Resolve a custom element's template by imitating Shadow DOM insertion points
    function collideHTML(template, element, force) {
        var uncollided = element.getAttribute('data-tevatron') !== 'collided';
        if (uncollided) {
            element.originalInnerHTML = element.innerHTML;
        }
        if (uncollided || force) {
            var newHTML = template;

            // Find all the insertion points
            var selectTags = template.match(/<content.*?><\/content>/g);
            var selectIndex = [];

            if (selectTags) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _getIterator(selectTags), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var tag = _step2.value;

                        // Grab the selection query
                        var query = new RegExp(/<content select=["'](.+?)["']><\/content>/g).exec(tag);
                        // If there's no query, then select everything
                        if (query === null) {
                            query = "***";
                        } else if (Array.isArray(query)) {
                            query = query[1];
                        }
                        // Push it into the index
                        selectIndex.push({
                            name: query,
                            insertionPoint: tag
                        });
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                            _iterator2['return']();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = _getIterator(selectIndex), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var index = _step3.value;

                        var selectedHTML = "";
                        // If there's no query, then select everything
                        if (index.name === "***") {
                            newHTML = newHTML.replace(index.insertionPoint, element.innerHTML);
                        } else {
                            // Run the query on the element
                            var selectedElements = element.querySelectorAll(index.name);
                            for (var i = 0; i < selectedElements.length; i++) {
                                selectedHTML += selectedElements[i].outerHTML;
                                selectedElements[i].remove();
                            }
                            newHTML = newHTML.replace(index.insertionPoint, selectedHTML);
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                            _iterator3['return']();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }

            // Replace the element's innerHTML with newHTML
            element.innerHTML = newHTML;
            element.setAttribute('data-tevatron', 'collided');
        }
    }
};

module.exports = exports['default'];

},{"babel-runtime/core-js/get-iterator":1,"babel-runtime/core-js/object/assign":2,"babel-runtime/core-js/object/create":3,"babel-runtime/core-js/object/define-property":4}]},{},[46])(46)
});