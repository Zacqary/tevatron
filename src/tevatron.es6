/*!
 * Tevatron v0.1.5
 * by Fast Company
 *
 * Copyright 2015 Mansueto Ventures, LLC and other contributors
 * Released under the MIT license
 *
 */
export default prototype => {
    if (prototype){
        // Create a prototype
        var newPrototype;
        // Handle any element extensions
        var extendsElementName = prototype.extends || '';
        extendsElementName = extendsElementName.toUpperCase();

        /* global HTMLTemplateElement */
        // Check to see if the template argument is a Template node, or if it's
        // an object from the builder script
        if (prototype.template && prototype.template instanceof HTMLTemplateElement){
            prototype.template = templateNodeToTemplateObj(prototype.template);
        }

        // By the time this element is registered, prototype.extends should only ever refer to
        // a non-custom element
        if (window.tevatronElements && window.tevatronElements.hasOwnProperty(extendsElementName)){
            // If this element is extending a Tevatron element, grab that element's prototype
            // and clear prototype.extends
            newPrototype = createElementPrototype(prototype.template, prototype.createdCallback, window.tevatronElements[extendsElementName]);
            prototype.extends = '';
        } else if (extendsElementName.indexOf('-') > -1){
            // If this element is trying to extend a custom element not registered with
            // Tevatron, don't let it
            prototype.extends = '';
        } else {
            newPrototype = createElementPrototype(prototype.template, prototype.createdCallback);
        }

        // If there's any CSS in the template, register it
        if (prototype.template && typeof prototype.template.css === 'string'){
            registerStyle(prototype.template.css, prototype.name);
        }
        // Add all properties into the prototype
        Object.assign(newPrototype, prototype);

        // Register the prototype as a custom element
        registerElement(newPrototype, prototype.name, prototype.extends);
    }

    // Convert a template node into html/css objects
    function templateNodeToTemplateObj(node){
        var obj = {};
        var htmlString = node.innerHTML;

        // Extract style tags from the template node's innerHTML
        var styleTags = htmlString.match(/<style>(.*?)<\/style>/g);
        htmlString = htmlString.replace(/<style>(.*?)<\/style>/g, '');
        var styleString = null;
        if (Array.isArray(styleTags)){
            styleString = '';
            for (let tag of styleTags){
                var thisStyle = tag;
                thisStyle = thisStyle.replace(/<\/?style>/g, '');
                styleString += thisStyle;
            }
        }

        obj.html = htmlString;
        obj.css = styleString;

        return obj;
    };

    // Create the element prototype
    function createElementPrototype(template, createdCallback, extendsElement){
        var baseElement = extendsElement || HTMLElement;
        var ElementPrototype = Object.create(baseElement.prototype);

        // Add an immutable property to the ElementPrototype
        function addConstant(name, value){
            Object.defineProperty(ElementPrototype, name, {
                get: function(){
                    return value;
                },
                enumerable: 'true'
            });
        }

        if (typeof template === 'function'){
            createdCallback = template;
        }
        if (typeof createdCallback === 'function'){
            addConstant('canonicalCreatedCallback', createdCallback);
        }

        // Set this element's createdCallback to resolve the element's template,
        // and then call its canonical createdCallback
        addConstant('createdCallback', function(){
            // Collide this element's template, or, if it has no template,
            // its base element's template
            if (template && typeof template.html === 'string'){
                collideHTML(template.html, this);
            } else if (extendsElement && extendsElement.prototype.template) {
                collideHTML(extendsElement.prototype.template.html, this);
            }
            // Call this element's createdCallback, or, if it has none,
            // its base element's createdCallback
            if (typeof createdCallback === 'function'){
                createdCallback.call(this);
            } else if (extendsElement && extendsElement.prototype.canonicalCreatedCallback){
                extendsElement.prototype.canonicalCreatedCallback.call(this);
            }
        });

        // Reset this element's innerHTML and recollide it with its template
        addConstant('resetInnerHTML', function(newHTML){
            this.innerHTML = newHTML;
            if (this.template && typeof this.template.html === 'string'){
                collideHTML(this.template.html, this, true);
            }
        });

        // If this element extends another element, add these methods
        // to refer to the base element's original functions and properties
        if (extendsElement){
            addConstant('callOriginalFunction', function(method){
                return baseElement.prototype[method].call(this);
            });
            addConstant('getOriginalProperty', function(property){
                return baseElement.prototype[property];
            });
        }

        ElementPrototype.template = template;
        return ElementPrototype;
    };

    // Register a custom element with the document
    function registerElement(elementPrototype, name, extendsElement){
        // Make sure the tevatron element registry exists
        if (!window.tevatronElements) {
            window.tevatronElements = {};
        }
        // If this element isn't already registered, register it
        if (!window.tevatronElements[name.toUpperCase()]){
            // If this element is extending a non-custom element
            if (typeof extendsElement === 'string' && extendsElement !== '') {
                document.registerElement(name.toUpperCase(), {
                    prototype: elementPrototype,
                    extends: extendsElement
                });
            } else {
                window.tevatronElements[name.toUpperCase()] = document.registerElement(name.toUpperCase(), {
                    prototype: elementPrototype
                });
            }
        }
    };

    // Register a custom element's internal style tags by placing them
    // at the top of the <head>
    function registerStyle(styleString, name){
        var styleTag = document.getElementById(`#tevatron-styles-${name}`);
        if (styleTag === null){
            styleTag = document.createElement('style');
            styleTag.id = `#tevatron-styles-${name}`;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML += styleString;
    };

    // Resolve a custom element's template by imitating Shadow DOM insertion points
    function collideHTML(template, element, force){
        var uncollided = element.getAttribute('data-tevatron') !== 'collided';
        if (uncollided){
            element.originalInnerHTML = element.innerHTML;
        }
        if (uncollided || force){
            var newHTML = template;

            // Find all the insertion points
            var selectTags = template.match(/<content.*?><\/content>/g);
            var selectIndex = [];

            if (selectTags){
                for (let tag of selectTags) {
                    // Grab the selection query
                    var query = new RegExp(/<content select=["'](.+?)["']><\/content>/g).exec(tag);
                    // If there's no query, then select everything
                    if (query === null){
                        query = "***";
                    } else if (Array.isArray(query)){
                        query = query[1];
                    }
                    // Push it into the index
                    selectIndex.push({
                        name: query,
                        insertionPoint: tag
                    });
                }
                for (let index of selectIndex) {
                    var selectedHTML = "";
                    // If there's no query, then select everything
                    if (index.name === "***"){
                        newHTML = newHTML.replace(index.insertionPoint, element.innerHTML);
                    } else {
                        // Run the query on the element
                        var selectedElements = element.querySelectorAll(index.name);
                        for (let i = 0; i < selectedElements.length; i++){
                            selectedHTML += selectedElements[i].outerHTML;
                            selectedElements[i].remove();
                        }
                        newHTML = newHTML.replace(index.insertionPoint, selectedHTML);
                    }
                }
            }

            // Replace the element's innerHTML with newHTML
            element.innerHTML = newHTML;
            element.setAttribute('data-tevatron', 'collided');
        }
    };
};
