# Tevatron
**A lightweight custom elements library**

Tevatron is two things:

- A helper libary that eliminates some boilerplate code from declaring custom elements, but otherwise uses mostly vanilla syntax
- A [build script](https://github.com/fastcompany/tevatron-cli) that smashes together an `html` template into a custom element's `js` file, to get around the problems with HTML imports

With Tevatron, you can write a custom element using a standards-compliant workflow, and deploy it in a cross-browser compatible way using only Javascript. No HTML Imports or Shadow DOM required.

Tevatron allows you to deploy web components using only the technologies that are absolutely ready for production today.

## Install
`npm install tevatron`
or
`bower install tevatron`

## Use

### Write your HTML
To build a web component with Tevatron, write an HTML import file as you normally would, including the component's `<template>` tag, and `<content>` wherever you want an insertion point. See Mozilla Brick components for a style guide.

You can include multiple components in a single HTML import file as long as they have distinct IDs, like so:

```html
<template id='my-element-template'>
	<strong>This bold text will be at the beginning of my element</strong>
	<content></content>
</template>

<template id='my-second-element-template'>
	<content></content>
	<strong>This bold text will be at the end of my second element</strong>
</template>
```

#### `<style>` Tags
Tevatron does support `<style>` tags inside a `<template>`, but it will **not** behave like a Shadow DOM `<style>` tag. Its innerHTML will be inserted into a `<style id="tevatron-styles">` tag prepended to your `<head>`. Keep that limitation in mind. This means you will need to use very specific selectors, because your styles will not be encapsulated. Instead of using `p{}`, use `my-element p{}`

### Write your Javascript
Your element's Javascript can be written in an inline `<script>` tag, or linked to with a `<script src>` tag.

Instead of declaring your element like this:
```javascript
var MyElementPrototype = Object.create(HTMLElement.prototype);
var currentScript = document._currentScript || document.currentScript;
MyElementPrototype.createdCallback = function(){
	var importDoc = currentScript.ownerDocument;
	var template = importDoc.querySelector('#my-element-template');

	var shadowRoot = this.createShadowRoot();
	shadowRoot.appendChild(template.content.cloneNode(true));
}

// Add more stuff to prototype

if (!window.MyElement) {
	window.MyElement = document.registerElement('my-element', {
		prototype: MyElementPrototype
	});
}
```
declare it like this:
```javascript
Tevatron({
	name: 'my-element',
	/* tevatron template: #my-element-template */ 
	createdCallback: function(){
		// Write your createdCallback here
	},
	anotherFunction: function(){
		// Every function in this object will be added to your prototype
	},
	anotherProperty: "Every other property in this object will also be added to your prototype"
});
```

**The /\* tevatron... \*/ comment is important.** This is the **Tevatron insertion point**, which tells the build script where to insert the HTML template for your custom element.

The syntax for the Tevatron insertion point is:
`/* tevatron template: #[<template> id in your HTML] */`

The `/* tevatron... */` insertion point will be replaced with `template: {html: '<your-html-template></your-html-template>', css: '<your-inline-styles></your-inline-styles>},`.

`Tevatron.createElement()` takes `tevatronTemplate` and a `function()` as an argument. This will return an element prototype, with a `createdCallback` that does the following:

1. Applies `tevatronTemplate` to your element's InnerHTML, inserting into the `<content>` tags as you'd normally expect a Shadow DOM insertion to behave
2. Calls your `function()` with your element bound to `this`. This is, for all intents and purposes, your element's `createdCallback`.

### Smash them together!
Use the [Tevatron CLI](https://github.com/fastcompany/tevatron-cli) to smash your components into easy-to-import Javascript files:

`tevatron -s /your_components_directory -t /your_output_directory`

or concatenate them:

`tevatron -s /your_components_directory -t output_filename -c`

### Include
Tevatron elements just requires a single dependency:
```html
<script src='tevatron.js'></script>
```

You'll probably also want to include [document-register-element](https://github.com/WebReflection/document-register-element), a 6kb polyfill for custom elements in browsers that haven't yet implemented them.

```html
<script src='document-register-element.js'></script>
<script src='tevatron.js'></script>
```

After you've included Tevatron and the optional polyfill, include your components file(s):
```html
<script src='my-component.js'></script>
<script src='my-other-component.js'></script>
```

## API
Every Tevatron element will include:
### resetInnerHTML(newHTML)
This function will change your element's original innerHTML (equivalent of a web component's Light DOM), and reapply your `tevatronTemplate`. Changing your element's innerHTML normally would destroy the markup added by your `tevatronTemplate`, and this function gets around that.

#### Example
```html
<!--Source-->
<template id="my-element-template">
	<my-markup>This was added by the tevatronTemplate</my-markup>
	<content select="strong"></content>
</template>

<my-element>
	<strong>This is my old innerHTML</strong>
</my-element>

<script>
	var changeThis = document.querySelector('my-element');
	changeThis.resetInnerHTML('<strong>This is my new innerHTML</strong><em>This is not</em>');
</script>
<!--End Source-->

<!--DOM Before-->
<my-element>
	<my-markup>This was added by the tevatronTemplate</my-markup>
	<strong>This is my old innerHTML</strong>
</my-element>

<!--DOM After-->
<my-element>
	<my-markup>This was added by the tevatronTemplate</my-markup>
	<strong>This is my new innerHTML</strong>
</my-element>
```
