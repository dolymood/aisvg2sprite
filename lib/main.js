var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');

module.exports = function(input, output, options) {
  // handle input & output
  input = path.resolve(input);
  var ext = path.extname(input);
  var inputName = path.basename(input, ext);
  if (!output) {
    output = path.dirname(input) + '/' + inputName + '.min' + ext;
  } else {
    output = path.resolve(output);
    var isD = false;
    try {
      isD = fs.lstatSync(output).isDirectory();
    } catch(e) {
      if (path.extname(output)) {
        isD = false;
      } else {
        isD = true;
      }
    }
    
    if (isD) {
      // directory
      output = output + '/' + inputName + ext;
    } else {
      if (path.extname(output) !== ext) {
        output += ext;
      }
    }
  }
  var demoName = path.dirname(output) + '/demo.html';

  // parse options
  var colorR = '[a-f0-9]';
  if (options.removeFill === true) {
    options.removeFill = colorR;
  }
  if (options.removeStroke === true) {
    options.removeStroke = colorR;
  }

  var code = fs.readFileSync(input).toString().trim();
  var result;

  // spaces
  code = code.replace(/[ ]{2,}/g, ' ');
  // newline
  if (options.minimize) {
    code = code.replace(/\r\n/g, '');
    code = code.replace(/\s{2,}/g, ' ');
    code = code.replace(/\s+</g, '<');
  }
  // comments
  code = code.replace(/<!--.*-->/g, '');
  // svg attributes
  code = code.replace(/<svg[^>]*>/i, '<svg>');
  // XML processing instructions
  code = code.replace(/<\?xml.*\?>/gi, "");
  // doctype declaration
  code = code.replace(/<!doctype[^>]*>/gi, "");
  // fill
  var removeFill = options.removeFill;
  if (removeFill) {
    code = code.replace(new RegExp('fill="#?' + removeFill + '+"', 'gi'), '');
    code = code.replace(new RegExp('fill:#?' + removeFill + '+;?', 'gi'), '');
  }
  // stroke
  var removeStroke = options.removeStroke;
  // add stroke-width="1"
  // if stroke-width is 1, then should be added to the
  // element's style
  // so we can control the svg's stroke-width
  /*
    ```css
      svg {stroke:#fff;stroke-width:0;}
    ```
   */
  code = code.replace(new RegExp('stroke="#?' + (removeStroke || colorR) +
    '+"(\\s?stroke-width="[\\.\\d]+")?', 'gi'), function(m, g) {
    if (g) return removeStroke ? g : m;
    return removeStroke ? ' stroke-width="1"': (m + ' stroke-width="1"');
  });
  code = code.replace(new RegExp('stroke:#?' + (removeStroke || colorR) +
    '+;?(stroke-width:[\\.\\d]+;?)?', 'gi'), function(m, g) {
    if (g) return removeStroke ? g : m;
    return removeStroke ? ';stroke-width:1;' : (m + ';stroke-width:1;');
  });
  // empty style
  code = code.replace(/style=""/g, '');

  jsdom.env(code, function (errors, window) {
    var symbols = window.document.querySelectorAll('symbol');
    var svgE = symbols[0].parentElement;
    svgE.innerHTML = '';
    var s = '';
    var html_svg = '';
    var addDemo = options.demo;
    [].slice.call(symbols).forEach(function(symbol) {
      if (!symbol.children.length) return;
      if (addDemo) {
        html_svg += _wrapHTML('<svg><use xlink:href="#'+ symbol.id +'"></use></svg>', false);
      }
      if (symbol.children.length > 1) {
        symbol.innerHTML = wrapHTML('<g transform="matrix(1 0 0 -1 0 0)">' +
          symbol.innerHTML + '</g>');
      } else {
        symbol.children[0].setAttribute('transform', 'matrix(1 0 0 -1 0 0)');
      }
      s += wrapHTML(symbol.outerHTML, false);
    });
    svgE.innerHTML = wrapHTML(s, true);
    result = svgE.parentElement.innerHTML;
    // free memory associated with the window
    window.close();
    endC(html_svg)
  });

  function wrapHTML(html, before) {
    return options.minimize ? html : _wrapHTML(html, before);
  }
  function _wrapHTML(html, before) {
    var newLine = '\r\n';
    return before ? (newLine + html) :
            before === undefined ? (newLine + html + newLine) :
              (html + newLine);
  }
  function endC(html_svg) {
    fs.writeFileSync(output, result);
    if (!options.demo) {
      showResult();
      return;
    }
    jsdom.env(path.resolve(__dirname, './index.html'), function(errors, window) {
      window.document.querySelector('#svgContainer').innerHTML = _wrapHTML(result);
      window.document.querySelector('#container').innerHTML = _wrapHTML(html_svg);

      fs.writeFileSync(demoName, _wrapHTML('<!DOCTYPE html>', false) + window.document.documentElement.outerHTML);
      window.close();
      showResult();
      console.log('Demo: ' + demoName);
    });
  }
  function showResult() {
    console.log('Done!');
    console.log('Output: ' + output);
  }
};
