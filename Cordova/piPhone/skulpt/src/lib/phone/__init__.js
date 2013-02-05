//Phone

var $builtinmodule = function(name)
{
    var mod = {};

/*
*************************************************************
This is the JavaScript functions part of the __init__.js file
*************************************************************
*/
    function onPhotoDataSuccess(imageData) {
          //This is to be used with drawphoto
          var smallImage = document.getElementById('smallImage');
          smallImage.style.display = 'block';
          smallImage.src = "data:image/jpeg;base64," + imageData;
          mod.imageData = imageData
        }

    function capturePhoto(name) {
      //Base64 image data, with callbacks
      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: destinationType.DATA_URL });
    }


    //This is an alert! dangerous with loop on phone, use EPP instead
    function onFail(message) {
      alert('Failed because: ' + message);
    }
    
/*
*************************************************************
This is the Python functions part of the __init__.js file
*************************************************************
*/
    
        
    mod.capturePhoto = new Sk.builtin.func(function(name){
        //This is asynch! not to be used with getPhotoData
        capturePhoto(name);
    });

    mod.getPhotoData = new Sk.builtin.func(function(){
        //This is slow, better to simply send photo
        return imageData64;
    });
    
    //This is to be used with capture photo
    mod.drawPhoto = new Sk.builtin.func(function(photoWidth,photoHeight){
        document.getElementById('visualOutput').innerHTML = ("<img              style=\"display:none;width:"+photoWidth+"px;height:"+photoHeight+"px;\"
         id=\"smallImage\" src=\"\" />")
        capturePhoto()
    });
    
    mod.getAccel = new Sk.builtin.func(function() {
        return String(accelData);
    });
    
    mod.alert = new Sk.builtin.func(function(s){
        alert(s.v);
    })
    
    mod.testRepeat = new Sk.builtin.func(function(object_){
        alert(object_)
        var loopID = setInterval(object_,300);
        alert(loopID)
    })
	
	return mod;
}