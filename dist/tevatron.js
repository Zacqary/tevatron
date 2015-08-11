(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tevatron = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Tevatron v0.1.5
 * by Fast Company
 *
 * Copyright 2015 Mansueto Ventures, LLC and other contributors
 * Released under the MIT license
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
Object.assign = Object.assign || function (target, src) {
    for (var i in src) {
        target[i] = src[i];
    }
};

var tevatronRegisterElement = function tevatronRegisterElement(prototype) {
    if (Array.isArray(prototype)) {
        prototype.forEach(tevatronRegisterElement);
        return;
    }

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
                for (var _iterator = styleTags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
        var ElementPrototype = Object.create(basePrototype);
        // Function to add an immutable property to the ElementPrototype
        function addConstant(name, value) {
            Object.defineProperty(ElementPrototype, name, {
                value: value,
                enumerable: 'true'
            });
        }

        // Add all properties into the prototype
        Object.assign(ElementPrototype, prototype);

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
            document.head.insertBefore(styleTag, document.head.childNodes[0]);
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
                    for (var _iterator2 = selectTags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var tag = _step2.value;

                        // Grab the selection query
                        var query = new RegExp(/<content select=["'](.+?)["']><\/content>/g).exec(tag);
                        // If there's no query, then select everything
                        if (query === null) {
                            query = '***';
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
                    for (var _iterator3 = selectIndex[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var index = _step3.value;

                        var selectedHTML = '';
                        // If there's no query, then select everything
                        if (index.name === '***') {
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

exports['default'] = function (prototypes) {
    if (!Array.isArray(prototypes)) {
        prototypes = [prototypes];
    }
    prototypes.forEach(tevatronRegisterElement);
};

module.exports = exports['default'];

},{}]},{},[1])(1)
});