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
  if (options.removeFill) {
    var removeFill = options.removeFill;
    code = code.replace(new RegExp('fill="#?' + removeFill + '+"', 'gi'), '');
    code = code.replace(new RegExp('fill:#?' + removeFill + '+;?', 'gi'), '');
  }
  if (options.removeStroke) {
    // add stroke-width="1"
    // if stroke-width is 1, then should be added to the
    // element's style
    // so we can control the svg's stroke-width
    /*
      ```css
        svg {stroke:#fff;stroke-width:0;}
      ```
     */
    
    var removeStroke = options.removeStroke;
    code = code.replace(new RegExp('stroke="#?' + removeStroke + '+"(\\s?stroke-width="[\\.\\d]+")?', 'gi'), function(m, g) {
      if (g) return g;
      return ' stroke-width="1"';
    });
    code = code.replace(new RegExp('stroke:#?' + removeStroke + '+;?(stroke-width:[\\.\\d]+;?)?', 'gi'), function(m, g) {
      if (g) return g;
      return 'stroke-width:1;';
    });
  }  
  // empty style
  code = code.replace(/style=""/g, '');

  var html_svg = '';
  var newLine = '\r\n';
  jsdom.env(code, function (errors, window) {
    var symbols = window.document.querySelectorAll("symbol");
    var svgE = symbols[0].parentElement;
    svgE.innerHTML = '';
    var s = '';
    [].slice.call(symbols).forEach(function(symbol) {
      html_svg += '<svg><use xlink:href="#'+ symbol.id +'"></use></svg>' + newLine;
      // child nodes
      [].slice.call(symbol.childNodes).forEach(function(child) {
        child.setAttribute && child.setAttribute("transform", "matrix(1 0 0 -1 0 0)");
      });
      s += symbol.outerHTML + (options.minimize ? '' : newLine);
    });
    svgE.innerHTML = (options.minimize ? '' : newLine) + s;
    result = svgE.parentElement.innerHTML;
    // free memory associated with the window
    window.close();
    endC()
  });

  function endC() {
    fs.writeFileSync(output, result);
    if (!options.demo) {
      showResult();
      return;
    }
    jsdom.env(path.resolve(__dirname, './index.html'), function(errors, window) {
      window.document.querySelector("#svgContainer").innerHTML = newLine + result + newLine;
      window.document.querySelector("#container").innerHTML = newLine + html_svg + newLine;

      fs.writeFileSync(demoName, '<!DOCTYPE html>' + newLine + window.document.documentElement.outerHTML);
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
