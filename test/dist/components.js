var exports = { _asArray: [], all() { return this._asArray; } };
let Tevatron = prototype => { exports[prototype.name] = prototype; exports._asArray.push(prototype); };
// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 0 ===
    Tevatron({
        name: 'test-one',
        template: {html: '<p>I should appear first in the element</p><content select="p"></content><p>I should appear third in the element</p><content select="#second"></content><p><content select=".fourth"></content></p><p>I should appear fifth in the element</p>', css: 'test-one .fourth{font-weight: bold;}test-one p:nth-of-type(3){color: red;}'},
    });

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 1 ===
    Tevatron({
        name: 'test-three-base',
        template: {html: '<span class="hello">Hello, world</span>'},
        createdCallback: function(){
            this.style.color = 'red';
        },
        testFunction1: function(){
            return 8;
        },
        testProperty1: 10
    });
    Tevatron({
        name: 'test-three',
        inherits: 'test-three-base',
        attachedCallback: function(){
            this.testProperty1 = this.getOriginalProperty('testProperty1') + 2;
        },
        testFunction1: function(){
            return this.callOriginalFunction('testFunction1') + 2;
        }
    });

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 2 ===
    Tevatron({
        name: 'test-four',
        template: {html: '<content select=".img1"></content>'},
        extends: 'canvas',
        attachedCallback: function(){
            var ctx = this.getContext('2d');
            this.height = 200;
            this.width = 200;
            ctx.clearRect(0,0,200,200);
            ctx.fillStyle = 'black';
            ctx.fillRect(0,0,100,100);
            ctx.fillStyle = 'red';
            ctx.fillRect(100,0,100,100);
            ctx.fillStyle = 'black';
            ctx.fillRect(100,100,100,100);
            ctx.fillStyle = 'red';
            ctx.fillRect(0,100,100,100);
            var imgs = this.querySelectorAll('img');
            for (var i =0; i < imgs.length; i++){
                ctx.drawImage(imgs[i], 37.5,37.5,125,125);
            }
        }
    });

// =========================
// test/src/components/components.html-inline
// =========================
// === script tag 3 ===
    Tevatron({
        name: 'test-five',
        template: {html: '<content select="h4"></content><p>This should appear second</p><content select=".third"></content>'},
        attachedCallback: function(){
            setTimeout(function(){
                this.resetInnerHTML(this.originalInnerHTML + "<p class='third'>This should appear third</p>");
            }.bind(this), 5);
        }
    });

export default exports;
