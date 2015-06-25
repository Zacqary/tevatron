// =========================
// component-src/components.html-inline
// =========================
// === script tag 0 ===
    Tevatron({
        name: 'test-one',
        template: {html: '<p>I should appear first in the element</p><content select="p"></content><p>I should appear third in the element</p><content select="#second"></content><p><content select=".fourth"></content></p><p>I should appear fifth in the element</p>', css: 'test-one .fourth{font-weight: bold;}test-one p:nth-of-type(3){color: red;}'},
    });

// =========================
// component-src/components.html-inline
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
        extends: 'test-three-base',
        attachedCallback: function(){
            this.testProperty1 = this.getOriginalProperty('testProperty1') + 2;
        },
        testFunction1: function(){
            return this.callOriginalFunction('testFunction1') + 2;
        }
    });

// =========================
// component-src/components.html-inline
// =========================
// === script tag 2 ===
    Tevatron({
        name: 'test-four',
        template: {html: '<content select="h4"></content><p>This should appear second</p><content select=".third"></content>'},
        attachedCallback: function(){
            setTimeout(function(){
                this.resetInnerHTML(this.originalInnerHTML + "<p class='third'>This should appear third</p>");
            }.bind(this), 5);
        }
    });

