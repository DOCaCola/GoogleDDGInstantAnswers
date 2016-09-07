// ==UserScript==
// @name        Google Search: DuckDuckGo Instant Answers
// @description Adds DuckDuckGo search Instant Answers (zero click) to Google search pages
// @author      DOCa Cola
// @license     GNU GPLv3
// @version     1.0
// @noframes
// @include     /^https?://www\.google\.(am|az|by|co\.uz|com|com\.tr|com\.ua|de|ee|fi|ge|kg|kz|lt|lv|md|ru|tm)/.*$/
// @include     https://encrypted.google.com/*
// @grant       GM_xmlhttpRequest
// @connect     api.duckduckgo.com
// ==/UserScript==

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function addCSSStyle() {
    var cssStyle = document.createElement('style');
    cssStyle.type = 'text/css';
    cssStyle.textContent = [
        'pre, tt, code {',
        'font-family: Consolas, Menlo, Monaco, monospace !important;',
        'color: #393939;',
        'background: #eaeaea;',
        '-moz-border-radius: 0.25em;',
        '-webkit-border-radius: 0.25em;',
        'border-radius: 0.25em;',
        'background-clip: padding-box;',
        '}',
        'pre {',
        'border: 1px solid #dbdbdb;',
        'padding: 0.55em 0;',
        'padding-left: 0.5em;',
        'margin: 0.5em 0;',
        '}',
    ].join('\n');
    document.head.appendChild(cssStyle);
}

function onDOMLoad() {
    // Only show info box on first page
    var startPage = getUrlVars()["start"];
    if ( typeof startPage !== 'undefined' && startPage !== '0')
        return;

    addCSSStyle();

    var searchText = document.getElementById('lst-ib');
    if(searchText && searchText.value.length > 0) {
        var ret = GM_xmlhttpRequest({
            method: "GET",
            url: "https://api.duckduckgo.com/?format=json&q="+encodeURIComponent(searchText.value),
            onload: function(res) {
                var response = JSON.parse(res.responseText);

                // Abort if query is empty type or has no meaningful description
                if (!response.Type.length || !response.AbstractText.length)
                    return;

                // Right hand side block of google page
                var rhsBlock = document.getElementById('rhs_block');

                var boxElem = document.createElement('div');
                boxElem.setAttribute("style", "box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.2);margin: 6px -32px 0 2px;width: 424px;padding: 15px;");

                // Image
                if (response.Image.length)
                {
                    var imgElem = document.createElement("img");
                    imgElem.src = response.Image;
                    imgElem.setAttribute("style", "max-height: 100px;max-width: 200px;float: right;padding-left: 20px;padding-bottom: 20px;");
                    boxElem.appendChild(imgElem);
                }

                // Heading
                var headingElem = document.createElement('div');
                headingElem.innerHTML = response.Heading;
                headingElem.classList.add('kno-ecr-pt');
                headingElem.setAttribute("style", "font-size: 2em;padding-bottom: 0.5em;display: block;");
                //boxElem.innerHTML += xhr.responseText;
                boxElem.appendChild(headingElem);

                // Text
                var textElem = document.createElement('div');
                textElem.setAttribute("style", "line-height: 1.24em;");
                textElem.innerHTML = response.AbstractText;
                boxElem.appendChild(textElem);

                // More-info link
                if (response.AbstractURL.length)
                {
                    var moreInfoLink = document.createElement('a');
                    moreInfoLink.setAttribute("style", "padding-top: 5px;display: block;");
                    moreInfoLink.href = response.AbstractURL;

                    // add source icon
                    // First get domain
                    var url = response.AbstractURL;
                    var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
                    var domain = matches && matches[1];  // domain will be null if no match is found
                    var srcIconElem = document.createElement("img");
                    srcIconElem.src = '//www.google.com/s2/favicons?domain='+domain;
                    srcIconElem.width = 16;
                    srcIconElem.height = 16;
                    srcIconElem.setAttribute("style", "vertical-align: middle;padding-right: 0.5em;");
                    moreInfoLink.appendChild(srcIconElem);

                    var linkText = document.createTextNode("More at " + response.AbstractSource);
                    moreInfoLink.appendChild(linkText);

                    boxElem.appendChild(moreInfoLink);
                }
                rhsBlock.appendChild(boxElem);
            }
        });
    }
}

onDOMLoad();

