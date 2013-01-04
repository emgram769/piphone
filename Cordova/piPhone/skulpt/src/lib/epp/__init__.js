//External Processing Package

var $builtinmodule = function(name)
{
    var mod = {};
    


/*
*************************************************************
This is the JavaScript functions part of the __init__.js file
*************************************************************
*/
    var code = $('backgroundStorage');
    var output = $('edoutput');
    var visualOutput = $('visualOutput');
    var visualOutputButtons = $('visualOutputButtons');
    var getID;
    var capturingPhoto=false;
    var loadingData=false;
    var dataQueue=0;
    var allPhotoDataSent=true;
    var outf = function(text){
                output.set('html', output.get('html') + text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>"));
            };
    var hostname;        
    var streamAccelerometerData = function(){
            jQuery.ajax({

                        type:'POST',
                        async: true,
                        url: hostname,
                        timeout: 150,
                        data: {
                            accel:accelData.toString(),
                            },
                        success: function(result){
                            console.log('success');
                            visualOutput.innerHTML = 'Connected';
                        },
                        error: function(result,textStatus,errorThrown){
                            console.log(textStatus,errorThrown);
                            if (textStatus == 'timeout'){
                                visualOutput.innerHTML = 'Sending data';
                            }else{
                            visualOutput.innerHTML = 'Error -- Disconnected!';
                        }
                    }
                });
        };
    var onSuccessHostNameSet = function(){
        streamID = setInterval(streamAccelerometerData, 200);
        visualOutputButtons.innerHTML = "<button id=\"kill\" 
        onclick=\"clearInterval(streamID); $('visualOutputButtons')
        .innerHTML = (''); \">Kill Stream</button>";
    };
    
    var setHostName = function(ipaddress){
        hostname = ipaddress
        onSuccessHostNameSet();
    };
    
    function onPhotoDataSuccess(imageData,hostlocation,name) {
        outf('Sending data...\n')
        capturingPhoto=false
        var imageName = name.v
        jQuery.ajax({
                    type: "POST",
                    url: hostlocation.v+"/image",
                    data: {data: imageData, name: imageName},
                    success: function(result){
                        loadingData=false;
                        dataQueue-=1;
                        outf('Data sent!\n');
                    },
                    error: function(result,textStatus,errorThrown){
                        loadingData=false;
                        dataQueue-=1;
                        outf(textStatus+': '+errorThrown+'\n');
                    }
                });
        
    };
    function onFail(message) {
      outf('Failed because: ' + message);
    }
    function capturePhoto(hostlocation,name) {
        loadingData=true;
        if (capturingPhoto==false){
            capturingPhoto=true;
            allPhotoDataSent=false;
            alert('Taking Photo!');
            function onPhotoDataSuccessWrapper(imageData){
                onPhotoDataSuccess(imageData,hostlocation,name)
            };
            navigator.camera.getPicture(onPhotoDataSuccessWrapper, onFail,
                {quality: 10, destinationType: destinationType.DATA_URL });
        } else{
            function capturePhotoWrapper(){
                capturePhoto(hostlocation,name)
            };
            setTimeout(capturePhotoWrapper,200);
            allPhotoDataSent=false;
        };
        };
    
    
    function selectPhoto(hostlocation,name) {
        loadingData=true;
        if (capturingPhoto==false){
            capturingPhoto=true;
            allPhotoDataSent=false;
            alert('Select Photo');
            function onPhotoDataSuccessWrapper(imageData){
                onPhotoDataSuccess(imageData,hostlocation,name)
            };
            navigator.camera.getPicture(onPhotoDataSuccessWrapper, onFail, 
                { quality: 10, destinationType: destinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY });
        } else{
            function selectPhotoWrapper(){
                selectPhoto(hostlocation,name)
            };
            setTimeout(selectPhotoWrapper,200);
            allPhotoDataSent=false;
        };
        };

    var getImageData = function(){
        if (imageData64!=null){
            clearInterval(getID);
            return
        };
    };
    

/*
*************************************************************
This is the Python functions part of the __init__.js file
*************************************************************
*/
    
    
    mod.testFunc = new Sk.builtin.func(function(){
        alert('ehy');
    });

    mod.sendPhotoData = new Sk.builtin.func(function(hostlocation,name){
       capturePhoto(hostlocation,name);
       dataQueue+=1;
    });

    mod.sendImageData = new Sk.builtin.func(function(hostlocation,name){
       selectPhoto(hostlocation,name);
       dataQueue+=1;
    });

    mod.streamAccelerometerData = new Sk.builtin.func(function(hostname){
        setHostName(hostname.v);
    });
    
    mod.getCode = new Sk.builtin.func(function(){
       return(code.innerHTML);
    });
    mod.EPP = Sk.misceval.buildClass(mod,function($gbl,$loc){
       $loc.__init__ = new Sk.builtin.func(function(self){
           self.package = {};
       });
       
       $loc.push = new Sk.builtin.func(function(self,key,data){
           self.packKey = key.v;
           if (data.v == undefined){
               self.packData = data;
           }else{
               self.packData = data.v;
           }
           self.package[self.packKey] = self.packData;
        });
        
        $loc.loadImage = new Sk.builtin.func(function(self,key){
           self.packKey = key.v;
           getID = setInterval(getImageData,200)
           self.packData = imageData;
           self.package[self.packKey] = self.packData;
        });
        
        
        $loc.remove = new Sk.builtin.func(function(self,key){
           delete self.package[key];
        });
        
        $loc.send = new Sk.builtin.func(function(self,hostname,password){
            var sendData = function(){
                if (loadingData===false && dataQueue===0){
                outf('Sending package data...\n')
                self.package['key'] = password.v
                jQuery.ajax({
                            type: "POST",
                            url: hostname.v,
                            data: self.package,
                            success: function(result){
                                outf(result);
                                $('visualOutput').set('text','');
                                new Fx.Scroll('edoutput').toBottom();
                            },
                            error: function(result){
                                outf('Could not connect to server\n');
                                $('visualOutput').set('text','');
                                new Fx.Scroll('edoutput').toBottom();
                            }
                        });
                }else{
                    setTimeout(sendData,400);
                }
                
            };
            sendData()
        });
        $loc.debug = new Sk.builtin.func(function(self,key){
            alert(key.v+' is '+self.package[key.v]);
        });
        
    }, 'EPP', []);
	
	
	return mod;
}