# Tevatron

Tevatron is two things:

- A helper libary that eliminates some boilerplate code from declaring custom elements (but otherwise uses vanilla syntax inspired by Mozilla Brick)
- A build script that smashes together an `html` template into a custom element's `js` file, to get around the problems with HTML imports

With Tevatron, you can write a web component using a standards-compliant workflow, and deploy it in a cross-browser compatible way using only Javascript. No HTML imports or Shadow DOM required.

Tevatron allows you to deploy web components using only the technologies that are absolutely ready for production today.

## Building

### Write your HTML
To build a web component with Tevatron, write an HTML import file as you normally would, including the component's `<template>` tag, and `<content>` wherever you want an insertion point. See Mozilla Brick components for a style guide.

You can include multiple components in a single HTML import file as long as they have distinct IDs, like so:

```
<template id='my-element-template'>
	<strong>This bold text will be at the beginning of my element</strong>
	<content></content>
</template>

<template id='my-second-element-template'>
	<content></content>
	<strong>This bold text will be at the end of my second element</strong>
</template>
```

**TODO:** Tevatron does not currently bundle any `<script>` tags included in your HTML import file. This may be a helpful feature to add later in order to keep the Tevatron workflow close to the web component spec.

#### `<style>` Tags
Tevatron does support `<style>` tags inside a `<template>`, but it will **not** behave like a Shadow DOM `<style>` tag. Its innerHTML will be inserted into a `<style id="tevatron-styles">` tag prepended to your `<head>`. Keep that limitation in mind. This means you will need to use very specific selectors, because your styles will not be encapsulated. Instead of using `p{}`, use `my-element p{}`


### Write your Javascript
Write a script to register your custom element, with the following caveats:

Instead of declaring your element like this:
```
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
```
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
First, run `npm link` from the `tevatron` root directory to create a symlink to the command line tool, and run `npm install` to make sure dependencies are installed.

Use this syntax:
`tevatron -h yourHTMLFile.html -j yourJSFile.js -o outputFile.js`

This will smash your HTML file into your JS file and output it as `outputFile.js`.

#### Rust Builder (Experimental)
`tevatron-build-rs` contains a version of the Tevatron builder written in Rust. Running `cargo build --release` on this crate will compile a binary that executes approximately 4 times faster than the node-based builder. (The debug build doesn't come with any performance improvements)

### Include
Tevatron elements require these two dependencies:
```
<script src='document-register-element.js'></script>
<script src='tevatron.js'></script>
```

- `document-register-element.js` is a polyfill for browsers that don't support custom elements yet. It's only 6 kb minified and more cross-browser compatible than the official `webcomponents.js` polyfill.
- `tevatron.js` is the Tevatron helper library which declares all the `Tevatron` methods.

After you've included those, include your `outputFile.js`

## API
Every Tevatron element will include:
### resetInnerHTML(newHTML)
This function will change your element's original innerHTML (equivalent of a web component's Light DOM), and reapply your `tevatronTemplate`. Changing your element's innerHTML normally would destroy the markup added by your `tevatronTemplate`, and this function gets around that.

#### Example
```
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
