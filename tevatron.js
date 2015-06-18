var Tevatron = function(args){

	if (args){
		var newPrototype;
		var extendsElement = args.extends || '';
		extendsElement = extendsElement.toUpperCase();
		/* global HTMLTemplateElement */
		if (args.template && args.template instanceof HTMLTemplateElement){
			args.template = templateNodeToTemplateObj(args.template);
		}

		if (window.tevatronElements && window.tevatronElements.hasOwnProperty(extendsElement)){
			newPrototype = createElementPrototype(args.template, args.createdCallback, window.tevatronElements[extendsElement]);
			args.extends = '';
		} else if (extendsElement.indexOf('-') > -1){
			args.extends = '';
		} else {
			newPrototype = createElementPrototype(args.template, args.createdCallback);
		}

		if (args.template && typeof args.template.css === 'string'){
  			registerStyle(args.template.css, args.name);
		}
		for (var i in args){
			if (i !== 'createdCallback'){
				newPrototype[i] = args[i];
			}
		}

		registerElement(newPrototype, args.name, args.extends);
	}

	function templateNodeToTemplateObj(node){
		var obj = {};
		var htmlString = node.innerHTML;

		var styleTags = htmlString.match(/<style>(.*?)<\/style>/g);
		htmlString = htmlString.replace(/<style>(.*?)<\/style>/g,'');
		var styleString = null;
		if (Array.isArray(styleTags)){
			styleString = '';
			for (var j in styleTags){
				var thisStyle = styleTags[j];
				thisStyle = thisStyle.replace(/<\/?style>/g,'');
				styleString += thisStyle;
			}
		}

		obj.html = htmlString;
		obj.css = styleString;

		return obj;
	}

	function createElementPrototype(template, createdCallback, extendsElement){
		var baseElement = extendsElement || HTMLElement;
		var ElementPrototype = Object.create(baseElement.prototype);
		if (typeof template === 'function'){
			createdCallback = template;
		}
		if (typeof createdCallback === 'function'){
			ElementPrototype.canonicalCreatedCallback = createdCallback;
		}

		ElementPrototype.createdCallback = function(){
			if (template && typeof template.html === 'string'){
	  			collideHTML(template.html, this);
			} else if (extendsElement && extendsElement.prototype.template) {
				collideHTML(extendsElement.prototype.template.html, this);
			}
			var callback;
	  		if (typeof createdCallback === 'function'){
	  			callback = createdCallback.call(this);
	  		} else if (extendsElement && extendsElement.prototype.canonicalCreatedCallback){
	  			callback = extendsElement.prototype.canonicalCreatedCallback.call(this);
	  		}
		};

		ElementPrototype.resetInnerHTML = function(newHTML){
			this.innerHTML = newHTML;
			if (template && typeof template.html === 'string'){
	  			collideHTML(template.html, this);
			}
		};

		if (extendsElement){
			ElementPrototype.callOriginalFunction = function(method){
				baseElement.prototype[method].bind(this)();
			};
			ElementPrototype.getOriginalProperty = function(property){
				return baseElement.prototype[property];
			};
		}

		ElementPrototype.template = template;
		return ElementPrototype;
	}

	function registerElement(elementPrototype, name, extendsElement){
		if (!window.tevatronElements) {
			window.tevatronElements = {};
		}
		if (!window.tevatronElements[name.toUpperCase()]){
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
	}

	function registerStyle(styleString, name){
		var styleTag = document.getElementById('#tevatron-styles-'+name);
		if (styleTag === null){
			styleTag = document.createElement('style');
			styleTag.id = '#tevatron-styles-'+name;
			document.head.appendChild(styleTag);
		}
		styleTag.innerHTML += styleString;
	}
	
	function collideHTML(template, element){
		if (element.getAttribute('data-tevatron') !== 'collided'){
			var newHTML = template;

			var selectTags = template.match(/<content.*?><\/content>/g);
			var selectIndex = [];

			if (selectTags){
				for (var i in selectTags){
					var tagName = new RegExp(/<content select=["'](.+?)["']><\/content>/g).exec(selectTags[i]);
					if (tagName === null){
						tagName = "***";
					} else if (Array.isArray(tagName)){
						tagName = tagName[1];
					}
					selectIndex.push({
						name: tagName,
						insertionPoint: selectTags[i]
					});
				}
				for (var j in selectIndex){
					var selectedHTML = "";
					if (selectIndex[j].name === "***"){
						newHTML = newHTML.replace(selectIndex[j].insertionPoint,element.innerHTML);
					} else {
						var selectedElements = element.querySelectorAll(selectIndex[j].name);
						for (var l = 0; l < selectedElements.length; l++){
							selectedHTML += selectedElements[l].outerHTML;
							selectedElements[l].remove();
						}
						newHTML = newHTML.replace(selectIndex[j].insertionPoint,selectedHTML);
					}
				}
			}

			element.originalInnerHTML = element.innerHTML;
			element.innerHTML = newHTML;
			element.setAttribute('data-tevatron', 'collided');
		}
	}
};