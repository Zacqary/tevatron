/*!
 * Tevatron v0.1.0
 * by Fast Company
 *
 * Copyright 2015 Mansueto Ventures, LLC and other contributors
 * Released under the MIT license
 *
 */
export default (args) => {
	if (args){
		// Create a prototype
		var newPrototype;
		// Handle any element extensions
		var extendsElement = args.extends || '';
		extendsElement = extendsElement.toUpperCase();

		// Check to see if the template argument is a Template node, or if it's
		// an object from the builder script
		if (args.template && args.template instanceof HTMLTemplateElement){
			args.template = templateNodeToTemplateObj(args.template);
		}

		// By the time this element is registered, args.extends should only ever refer to
		// a non-custom element
		if (this.tevatronElements && this.tevatronElements.hasOwnProperty(extendsElement)){
			// If this element is extending a Tevatron element, grab that element's prototype
			// and clear args.extends
			newPrototype = createElementPrototype(args.template, args.createdCallback, this.tevatronElements[extendsElement]);
			args.extends = '';
		} else if (extendsElement.indexOf('-') > -1){
			// If this element is trying to extend a custom element not registered with
			// Tevatron, don't let it
			args.extends = '';
		} else {
			newPrototype = createElementPrototype(args.template, args.createdCallback);
		}

		// If there's any CSS in the template, register it
		if (args.template && typeof args.template.css === 'string'){
  			registerStyle(args.template.css, args.name);
		}
		// Add all other args into the prototype
		for (let i in args){
			if (i !== 'createdCallback'){
				newPrototype[i] = args[i];
			}
		}

		// Register the prototype as a custom element
		registerElement(newPrototype, args.name, args.extends);
	}

	// Convert a template node into html/css objects
	function templateNodeToTemplateObj(node){
		var obj = {};
		var htmlString = node.innerHTML;

		// Extract style tags from the template node's innerHTML
		var styleTags = htmlString.match(/<style>(.*?)<\/style>/g);
		htmlString = htmlString.replace(/<style>(.*?)<\/style>/g,'');
		var styleString = null;
		if (Array.isArray(styleTags)){
			styleString = '';
			for (let tag of styleTags){
				var thisStyle = tag;
				thisStyle = thisStyle.replace(/<\/?style>/g,'');
				styleString += thisStyle;
			}
		}

		obj.html = htmlString;
		obj.css = styleString;

		return obj;
	}

	// Create the element prototype
	function createElementPrototype(template, createdCallback, extendsElement){
		var baseElement = extendsElement || HTMLElement;
		var ElementPrototype = Object.create(baseElement.prototype);
		if (typeof template === 'function'){
			createdCallback = template;
		}
		if (typeof createdCallback === 'function'){
			ElementPrototype.canonicalCreatedCallback = createdCallback;
		}

		// Set this element's createdCallback to resolve the element's template,
		// and then call its canonical createdCallback
		ElementPrototype.createdCallback = function(){
			// Collide this element's template, or, if it has no template,
			// its base element's template
			if (template && typeof template.html === 'string'){
	  			collideHTML(template.html, this);
			} else if (extendsElement && extendsElement.prototype.template) {
				collideHTML(extendsElement.prototype.template.html, this);
			}
			// Call this element's createdCallback, or, if it has none,
			// its base element's createdCallback
			var callback;
	  		if (typeof createdCallback === 'function'){
	  			callback = createdCallback.call(this);
	  		} else if (extendsElement && extendsElement.prototype.canonicalCreatedCallback){
	  			callback = extendsElement.prototype.canonicalCreatedCallback.call(this);
	  		}
		};

		// Reset this element's innerHTML and recollide it with its template
		ElementPrototype.resetInnerHTML = function(newHTML){
			this.innerHTML = newHTML;
			if (this.template && typeof this.template.html === 'string'){
	  			collideHTML(this.template.html, this);
			}
		};

		// If this element extends another element, add these methods
		// to refer to the base element's original functions and properties
		if (extendsElement){
			ElementPrototype.callOriginalFunction = function(method){
				baseElement.prototype[method].call(this);
			};
			ElementPrototype.getOriginalProperty = function(property){
				return baseElement.prototype[property];
			};
		}

		ElementPrototype.template = template;
		return ElementPrototype;
	}

	// Register a custom element with the document
	function registerElement(elementPrototype, name, extendsElement){
		// Make sure the tevatron element registry exists
		if (!this.tevatronElements) {
			this.tevatronElements = {};
		}
		// If this element isn't already registered, register it
		if (!this.tevatronElements[name.toUpperCase()]){
			// If this element is extending a non-custom element
			if (typeof extendsElement === 'string' && extendsElement !== '') {
				document.registerElement(name.toUpperCase(), {
					prototype: elementPrototype,
					extends: extendsElement
				});
			} else {
				this.tevatronElements[name.toUpperCase()] = document.registerElement(name.toUpperCase(), {
					prototype: elementPrototype
				});
			}
		}
	}

	// Register a custom element's internal style tags by placing them
	// at the top of the <head>
	function registerStyle(styleString, name){
		var styleTag = document.getElementById('#tevatron-styles-'+name);
		if (styleTag === null){
			styleTag = document.createElement('style');
			styleTag.id = '#tevatron-styles-'+name;
			document.head.appendChild(styleTag);
		}
		styleTag.innerHTML += styleString;
	}
	
	// Resolve a custom element's template by imitating Shadow DOM insertion points
	function collideHTML(template, element){
		if (element.getAttribute('data-tevatron') !== 'collided'){
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
						newHTML = newHTML.replace(index.insertionPoint,selectedHTML);
					}
				}
			}

			// Replace the element's innerHTML with newHTML
			element.originalInnerHTML = element.innerHTML;
			element.innerHTML = newHTML;
			element.setAttribute('data-tevatron', 'collided');
		}
	}
};