(function() {
  var $body = document.body
  var $input = document.getElementById('replin');
  var ansi_up = new AnsiUp;
  var printRaw = (function () {
    var element = document.getElementById('replterm');
    if (element) element.textContent = ''; // clear browser cache
    return function (text) {
      element.innerHTML += text;
      $body.scrollTop = $body.scrollHeight;
    }
  })();

  function htmlEscape(text) {
    text = ansi_up.ansi_to_html(text);
    text = text.replace('\n', '<br>', 'g');
    return text;
  }

  function print(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    printRaw(htmlEscape(text));
  }

  // Don't print initial errors
  var errorsReady = false;

  // Line history
  var replHistory = [''];
  var historyIndex = 0;

  // prevent infinite restarts
  var restartCount = 0;

  var Module = {
    preRun: [],
    print: function(x) {
      print(x + '\n');
    },
    printErr: function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      if (errorsReady) {
        printRaw('<span style="color:#E55;">' + htmlEscape(text + '\n') + '</span>')
      } else {
        console.error(text);
      }
    },
    postRun: [function() {
      Module._repl_init()
      var repl_input = Module.cwrap('repl_input', 'void', ['string']);
      var repl_prompt = Module.cwrap('repl_prompt', 'string', []);
      var promptel = document.getElementById('replprompt');
      promptel.textContent = repl_prompt();

      $input.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          var content = $input.value;
          var text = content + '\n';
          replHistory.pop();
          replHistory.push(content);
          historyIndex = replHistory.length;
          replHistory.push('');
          $input.value = '';
          printRaw('<span style="color:#9198e5;">' + htmlEscape(repl_prompt()) + '<code>' + content + '</code><br></span>')
          repl_input(text);
          promptel.textContent = repl_prompt();
        } else if (e.keyCode === 38) {
          if (historyIndex > 0) {
            if (historyIndex === replHistory.length - 1) {
              replHistory.pop()
              replHistory.push($input.value)
            }
            historyIndex--;
            $input.value = replHistory[historyIndex];
          }
        } else if (e.keyCode === 40) {
          if (historyIndex < replHistory.length - 1) {
            if (historyIndex === replHistory.length - 1) {
              replHistory.pop()
              replHistory.push($input.value)
            }
            historyIndex++;
            $input.value = replHistory[historyIndex];
          }
        }
      });
      errorsReady = true;
    }],
  };

  window.onerror = function (code) {
    const element = document.getElementById('replterm');
    if (restartCount > 100) {
      element.innerHTML = '<span style="color:#E55">Repl restarted too many times. Browser may be unsupported.<span><br>';
    } else {
      restartCount++;
      element.innerHTML = '<span style="color:#E55">Restarting repl...</span><br>';
      Module._repl_deinit();
      Module._repl_init();
    }
  };

  document.body.addEventListener('click', e => {
    if(e.target.tagName == 'CODE') {
      $input.value = e.target.textContent;
      setTimeout(() => $input.focus());
    }
  })

  window.Module = Module;
})();
