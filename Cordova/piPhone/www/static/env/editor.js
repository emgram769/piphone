window.addEvent('domready', function() {
    // Initializes main editor
    var editor = CodeMirror.fromTextArea('code', {
        parserfile: ["parsepython.js"],
        stylesheet: "static/env/codemirror/css/pythoncolors.css",
        path: "static/env/codemirror/js/",
        lineNumbers: true,
        textWrapping: false,
        indentUnit: 4,
        height: "200px",
        fontSize: "12pt",
        autoMatchParens: true,
        parserConfig: {'pythonVersion': 2, 'strictErrors': true},
    });


    // Creates a button to show editors after hiding all editors and textoutput
    // It focuses the visual output with a nice slide effect
    $("focusvisual").addEvent('click', function(e){

      jQuery('#ide').hide('slow');
      document.getElementById('visualOutputButtons').innerHTML = (
      "<button id=\"showide\" class=\"iphonebutton\" onclick=\"jQuery(\'#ide\').show(\'slow\'); document.getElementById('visualOutputButtons').innerHTML = (''); \">Show IDE</button>")
    });
    
    $("externalvisual").addEvent('click', function(e){

      document.getElementById('visualOutput').innerHTML = (
      "<iframe class='outputframe' frameBorder='0' src='"+serverLocation+"/visualoutput'></iframe>")
    });
    
    // Clears both the textual and visual output
    $('clearoutput').addEvent('click', function(e)
        {
            e.stop();
            $('edoutput').set('text', '');
            $('visualOutput').set('text','');
            clearInterval(loopOfInterval);
        });
    // This stores the debugging server location and passwords
    var serverLocation = "http://128.237.133.45:5000"
    var serverPassword = "supersecretpassword";
    
    // Allows connection to be changed
    $("serverconnect").addEvent('click', function(e){
        serverLocation = prompt("Enter server name",serverLocation)
        serverPassword = prompt("Enter password")
    });

    // Function to be called on error
    var handleErrors = function (outf, e) {
        console.log(e);
        jQuery.ajax({
            type: "POST",
            url: serverLocation,
            data: {bugCode: editor.getCode(), key: serverPassword},
            success: function(result){
                outf(result);
                $('visualOutput').set('text','');
                new Fx.Scroll('edoutput').toBottom();
            },
            error: function(result){
                outf('Could not connect to server\nError handled in JavaScript\n'+ e + '\n');
                $('visualOutput').set('text','');
                new Fx.Scroll('edoutput').toBottom();
            }
        });
        $('visualOutput').set('text','Connecting to server to run code ... ');
    };
    
    // Run the code, if error call handleErrors
    $("runbutton").addEvent('click', function(e){
        var extraCodeStorage = $('backgroundStorage');
        if (extraCodeEditorOn == true){
        extraCodeStorage.innerHTML = extraCodeEditor.getCode();}
        var output = $('edoutput');
        
        var outf = function(text)
        {
            output.set('html',
            output.get('html') +
            text.replace(/</g, "&lt;").replace(/>/g,
                               "&gt;").replace(/\n/g,
                               "<br/>"));
        };
        var builtinRead = function(x)
        {
            if (Sk.builtinFiles === undefined ||
                Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
            return Sk.builtinFiles["files"][x];
        };
        Sk.configure({output:outf, read: builtinRead
            });
        e.stop();
        try{
            eval(Sk.importMainWithBody("<stdin>", false, editor.getCode()));
        } catch(e){
            handleErrors(outf, e)
        };
        new Fx.Scroll('edoutput').toBottom();
    });
    
    // This initializes a second editor to be used for loops or packaging
    var createExtraCode = function() {
        document.getElementById('extracode').innerHTML =
           ("Extra Code<textarea id=\"moreCode\">#write loop here</textarea>")
        extraCodeEditor = CodeMirror.fromTextArea('moreCode', {
        parserfile: ["parsepython.js"],
        stylesheet: "static/env/codemirror/css/pythoncolors.css",
        path: "static/env/codemirror/js/",
        lineNumbers: true,
        textWrapping: false,
        indentUnit: 4,
        height: "150px",
        fontSize: "12pt",
        autoMatchParens: true,
        parserConfig: {'pythonVersion': 2, 'strictErrors': true},
    });
    };
    // Variables pertaining to the editor created
    var extraCodeEditorOn = false
    var extraCodeEditor = null
    
    // Button to call the creationg of the editor
    $("create_extra").addEvent('click', function(e) {
        if (extraCodeEditorOn===false){
            createExtraCode();
            extraCodeEditorOn = true;
            document.getElementById('create_extra').innerHTML = ('Close Extra Code');
        } else {
            document.getElementById('create_extra').innerHTML = ('Create Extra Code');
            document.getElementById('extracode').innerHTML = ('');
            extraCodeEditorOn = false;
            extraCodeEditor = null;

        }
    });
    
    // Variables pertaining to the loop button
    var animationOn = false
    var loopID = null
    
    // Loops the code or, if there is extra code, the extra code
    // This is mainly a toy and not meant to be used for anything more than simple animation
    $("animater").addEvent('click', function(e){
        if (animationOn === false){
        var superRunner = function() {
            var output = $('edoutput');
            var outf = function(text)
            {
                output.set('html',
                output.get('html') +
                text.replace(/</g, "&lt;").replace(/>/g,
                        "&gt;").replace(/\n/g,
                        "<br/>"));
            };
            var builtinRead = function(x)
            {
                        if (Sk.builtinFiles === undefined ||
                            Sk.builtinFiles["files"][x] === undefined)
                        throw "File not found: '" + x + "'";
                        return Sk.builtinFiles["files"][x];
            };
            Sk.configure({output:outf, read: builtinRead
                });
            e.stop();
            codeSpot = extraCodeEditor
            codeSpot = codeSpot !== null ? codeSpot : editor;
            try{
                eval(Sk.importMainWithBody("<stdin>", false, codeSpot.getCode()));
            } catch(e){
                clearInterval(loopID);
                document.getElementById('animater').innerHTML = ('Loop');
                animationOn = false;
                handleErrors(outf,e)
            }
            new Fx.Scroll('edoutput').toBottom();
            };
            loopID = setInterval(superRunner,100);
            document.getElementById('animater').innerHTML = ('Stop');
            animationOn = true
        } else {
            clearInterval(loopID);
            document.getElementById('animater').innerHTML = ('Loop');
            animationOn = false
        }
    });
    
    
});
