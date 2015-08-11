(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }g.Tevatron = f();
    }
})(function () {
    var define, module, exports;return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
                }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }return n[o].exports;
        }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
    })({ 1: [function (require, module, exports) {
            /*!
             * Tevatron v0.1.5
             * by Fast Company
             *
             * Copyright 2015 Mansueto Ventures, LLC and other contributors
             * Released under the MIT license
             *
             */

            "use strict";

            Object.defineProperty(exports, "__esModule", {
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
                    if (prototype["extends"] && !prototype.inherits) {
                        prototype.inherits = prototype["extends"];
                    }

                    // Create the element's new prototype
                    var newPrototype = createElementPrototype(prototype.template, prototype.createdCallback, prototype.inherits);

                    // If there's any CSS in the template, register it
                    if (prototype.template && typeof prototype.template.css === "string") {
                        registerStyle(prototype.template.css, prototype.name);
                    }

                    // Register the prototype as a custom element
                    registerElement(newPrototype, prototype.name, prototype["extends"]);
                }

                // Convert a template node into html/css objects
                function templateNodeToTemplateObj(node) {
                    var obj = {};
                    var htmlString = node.innerHTML;

                    // Extract style tags from the template node's innerHTML
                    var styleTags = htmlString.match(/<style>(.*?)<\/style>/g);
                    htmlString = htmlString.replace(/<style>(.*?)<\/style>/g, "");
                    var styleString = null;
                    if (Array.isArray(styleTags)) {
                        styleString = "";
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = styleTags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var tag = _step.value;

                                var thisStyle = tag;
                                thisStyle = thisStyle.replace(/<\/?style>/g, "");
                                styleString += thisStyle;
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
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
                            enumerable: "true"
                        });
                    }

                    // Add all properties into the prototype
                    Object.assign(ElementPrototype, prototype);

                    if (typeof template === "function") {
                        createdCallback = template;
                    }
                    if (typeof createdCallback === "function") {
                        addConstant("canonicalCreatedCallback", createdCallback);
                    }

                    // Set this element's createdCallback to resolve the element's template,
                    // and then call its canonical createdCallback
                    ElementPrototype.createdCallback = function () {
                        // Collide this element's template, or, if it has no template,
                        // its base element's template
                        if (template && typeof template.html === "string") {
                            collideHTML(template.html, this);
                        } else if (inherits && basePrototype.template) {
                            collideHTML(basePrototype.template.html, this);
                        }
                        // Call this element's createdCallback, or, if it has none,
                        // its base element's createdCallback
                        if (typeof createdCallback === "function") {
                            createdCallback.call(this);
                        } else if (inherits && basePrototype.canonicalCreatedCallback) {
                            basePrototype.canonicalCreatedCallback.call(this);
                        }
                    };

                    // Reset this element's innerHTML and recollide it with its template
                    addConstant("resetInnerHTML", function (newHTML) {
                        this.innerHTML = newHTML;
                        if (this.template && typeof this.template.html === "string") {
                            collideHTML(this.template.html, this, true);
                        }
                    });

                    // If this element inherits another element, add these methods
                    // to refer to the base element's original functions and properties
                    if (inherits) {
                        addConstant("callOriginalFunction", function (method) {
                            return basePrototype[method].call(this);
                        });
                        addConstant("getOriginalProperty", function (property) {
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
                        if (typeof extendsElement === "string" && extendsElement !== "") {
                            document.registerElement(name.toUpperCase(), {
                                prototype: elementPrototype,
                                "extends": extendsElement
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
                    var styleTag = document.getElementById("#tevatron-styles-" + name);
                    if (styleTag === null) {
                        styleTag = document.createElement("style");
                        styleTag.id = "#tevatron-styles-" + name;
                        document.head.insertBefore(styleTag, document.head.childNodes[0]);
                    }
                    styleTag.innerHTML += styleString;
                }

                // Resolve a custom element's template by imitating Shadow DOM insertion points
                function collideHTML(template, element, force) {
                    var uncollided = element.getAttribute("data-tevatron") !== "collided";
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
                                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                        _iterator2["return"]();
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
                                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                        _iterator3["return"]();
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
                        element.setAttribute("data-tevatron", "collided");
                    }
                }
            };

            exports["default"] = function (prototypes) {
                if (!Array.isArray(prototypes)) {
                    prototypes = [prototypes];
                }
                prototypes.forEach(tevatronRegisterElement);
            };

            module.exports = exports["default"];
        }, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
/*! (C) WebReflection Mit Style License */
(function(e,t,n,r){"use strict";function rt(e,t){for(var n=0,r=e.length;n<r;n++)dt(e[n],t)}function it(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],nt(r,b[ot(r)])}function st(e){return function(t){j(t)&&(dt(t,e),rt(t.querySelectorAll(w),e))}}function ot(e){var t=e.getAttribute("is"),n=e.nodeName.toUpperCase(),r=S.call(y,t?v+t.toUpperCase():d+n);return t&&-1<r&&!ut(n,t)?-1:r}function ut(e,t){return-1<w.indexOf(e+'[is="'+t+'"]')}function at(e){var t=e.currentTarget,n=e.attrChange,r=e.prevValue,i=e.newValue;Q&&t.attributeChangedCallback&&e.attrName!=="style"&&t.attributeChangedCallback(e.attrName,n===e[a]?null:r,n===e[l]?null:i)}function ft(e){var t=st(e);return function(e){X.push(t,e.target)}}function lt(e){K&&(K=!1,e.currentTarget.removeEventListener(h,lt)),rt((e.target||t).querySelectorAll(w),e.detail===o?o:s),B&&pt()}function ct(e,t){var n=this;q.call(n,e,t),G.call(n,{target:n})}function ht(e,t){D(e,t),et?et.observe(e,z):(J&&(e.setAttribute=ct,e[i]=Z(e),e.addEventListener(p,G)),e.addEventListener(c,at)),e.createdCallback&&Q&&(e.created=!0,e.createdCallback(),e.created=!1)}function pt(){for(var e,t=0,n=F.length;t<n;t++)e=F[t],E.contains(e)||(F.splice(t,1),dt(e,o))}function dt(e,t){var n,r=ot(e);-1<r&&(tt(e,b[r]),r=0,t===s&&!e[s]?(e[o]=!1,e[s]=!0,r=1,B&&S.call(F,e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1,e[o]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="attached",o="detached",u="extends",a="ADDITION",f="MODIFICATION",l="REMOVAL",c="DOMAttrModified",h="DOMContentLoaded",p="DOMSubtreeModified",d="<",v="=",m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],y=[],b=[],w="",E=t.documentElement,S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},x=n.prototype,T=x.hasOwnProperty,N=x.isPrototypeOf,C=n.defineProperty,k=n.getOwnPropertyDescriptor,L=n.getOwnPropertyNames,A=n.getPrototypeOf,O=n.setPrototypeOf,M=!!n.__proto__,_=n.create||function vt(e){return e?(vt.prototype=e,new vt):this},D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),P=e.MutationObserver||e.WebKitMutationObserver,H=(e.HTMLElement||e.Element||e.Node).prototype,B=!N.call(H,E),j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)},F=B&&[],I=H.cloneNode,q=H.setAttribute,R=H.removeAttribute,U=t.createElement,z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0},W=P||function(e){J=!1,E.removeEventListener(c,W)},X,V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)},$=!1,J=!0,K=!0,Q=!0,G,Y,Z,et,tt,nt;O||M?(tt=function(e,t){N.call(t,e)||ht(e,t)},nt=ht):(tt=function(e,t){e[i]||(e[i]=n(!0),ht(e,t))},nt=tt),B?(J=!1,function(){var e=k(H,"addEventListener"),t=e.value,n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)},r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)},s=function(e){var t=e.currentTarget,n=t[i],r=e.propertyName,s;n.hasOwnProperty(r)&&(n=n[r],s=new CustomEvent(c,{bubbles:!0}),s.attrName=n.name,s.prevValue=n.value||null,s.newValue=n.value=t[r]||null,s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1,t.dispatchEvent(s))};e.value=function(e,o,u){e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className:{name:"class",value:this.className}},this.setAttribute=r,this.removeAttribute=n,t.call(this,"propertychange",s)),t.call(this,e,o,u)},C(H,"addEventListener",e)}()):P||(E.addEventListener(c,W),E.setAttribute(i,1),E.removeAttribute(i),J&&(G=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=Z(t);for(s in r){if(!(s in n))return Y(0,t,s,n[s],r[s],a);if(r[s]!==n[s])return Y(1,t,s,n[s],r[s],f)}for(s in n)if(!(s in r))return Y(2,t,s,n[s],r[s],l)}},Y=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,at(o)},Z=function(e){for(var t,n,r={},i=e.attributes,s=0,o=i.length;s<o;s++)t=i[s],n=t.name,n!=="setAttribute"&&(r[n]=t.value);return r})),t[r]=function(n,r){p=n.toUpperCase(),$||($=!0,P?(et=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new P(function(r){for(var i,s,o=0,u=r.length;o<u;o++)i=r[o],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,Q&&s.attributeChangedCallback&&i.attributeName!=="style"&&s.attributeChangedCallback(i.attributeName,i.oldValue,s.getAttribute(i.attributeName)))})}(st(s),st(o)),et.observe(t,{childList:!0,subtree:!0})):(X=[],V(function E(){while(X.length)X.shift().call(null,X.shift());V(E)}),t.addEventListener("DOMNodeInserted",ft(s)),t.addEventListener("DOMNodeRemoved",ft(o))),t.addEventListener(h,lt),t.addEventListener("readystatechange",lt),t.createElement=function(e,n){var r=U.apply(t,arguments),i=""+e,s=S.call(y,(n?v:d)+(n||i).toUpperCase()),o=-1<s;return n&&(r.setAttribute("is",n=n.toLowerCase()),o&&(o=ut(i.toUpperCase(),n))),Q=!t.createElement.innerHTMLHelper,o&&nt(r,b[s]),r},H.cloneNode=function(e){var t=I.call(this,!!e),n=ot(t);return-1<n&&nt(t,b[n]),e&&it(t.querySelectorAll(w)),t});if(-2<S.call(y,v+p)+S.call(y,d+p))throw new Error("A "+n+" type is already registered");if(!m.test(p)||-1<S.call(g,p))throw new Error("The type "+n+" is invalid");var i=function(){return f?t.createElement(l,p):t.createElement(l)},a=r||x,f=T.call(a,u),l=f?r[u].toUpperCase():p,c=y.push((f?v:d)+p)-1,p;return w=w.concat(w.length?",":"",f?l+'[is="'+n.toLowerCase()+'"]':l),i.prototype=b[c]=T.call(a,"prototype")?a.prototype:_(H),rt(t.querySelectorAll(w),s),i}})(window,document,Object,"registerElement");
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var _exports = { _asArray: [], all: function all() {
        return this._asArray;
    } };
var Tevatron = function Tevatron(prototype) {
    _exports[prototype.name] = prototype;_exports._asArray.push(prototype);
};
// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 0 ===
Tevatron({
    name: 'test-one',
    template: { html: '<p>I should appear first in the element</p><content select="p"></content><p>I should appear third in the element</p><content select="#second"></content><p><content select=".fourth"></content></p><p>I should appear fifth in the element</p>', css: 'test-one .fourth{font-weight: bold;}test-one p:nth-of-type(3){color: red;}' }
});

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 1 ===
Tevatron({
    name: 'test-three-base',
    template: { html: '<span class="hello">Hello, world</span>' },
    createdCallback: function createdCallback() {
        this.style.color = 'red';
    },
    testFunction1: function testFunction1() {
        return 8;
    },
    testProperty1: 10
});
Tevatron({
    name: 'test-three',
    inherits: 'test-three-base',
    attachedCallback: function attachedCallback() {
        this.testProperty1 = this.getOriginalProperty('testProperty1') + 2;
    },
    testFunction1: function testFunction1() {
        return this.callOriginalFunction('testFunction1') + 2;
    }
});

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 2 ===
Tevatron({
    name: 'test-four',
    template: { html: '<content select=".img1"></content>' },
    'extends': 'canvas',
    attachedCallback: function attachedCallback() {
        var ctx = this.getContext('2d');
        this.height = 200;
        this.width = 200;
        ctx.clearRect(0, 0, 200, 200);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'red';
        ctx.fillRect(100, 0, 100, 100);
        ctx.fillStyle = 'black';
        ctx.fillRect(100, 100, 100, 100);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 100, 100, 100);
        var imgs = this.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) {
            ctx.drawImage(imgs[i], 37.5, 37.5, 125, 125);
        }
    }
});

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 3 ===
Tevatron({
    name: 'test-five',
    template: { html: '<content select="h4"></content><p>This should appear second</p><content select=".third"></content>' },
    attachedCallback: function attachedCallback() {
        setTimeout((function () {
            this.resetInnerHTML(this.originalInnerHTML + '<p class=\'third\'>This should appear third</p>');
        }).bind(this), 5);
    }
});

exports['default'] = _exports;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _distTevatronJs = require('../../dist/tevatron.js');

var _distTevatronJs2 = _interopRequireDefault(_distTevatronJs);

require('document-register-element');

var _distComponents = require('../dist/components');

var _distComponents2 = _interopRequireDefault(_distComponents);

(0, _distTevatronJs2['default'])(_distComponents2['default'].all());
(0, _distTevatronJs2['default'])({
	name: 'test-two',
	template: document.getElementById('test-two-template')
});

},{"../../dist/tevatron.js":1,"../dist/components":3,"document-register-element":2}]},{},[4]);
