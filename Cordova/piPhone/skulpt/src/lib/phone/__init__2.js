//Phone

var $builtinmodule = function(name)
{
    var mod = {};
    var myfact = function(n) {
         if(n < 1) {
             return 1;
         } else {
             return n * myfact(n-1);
         }
    };

    mod.fact = new Sk.builtin.func(function(a) {
        return myfact(a);
    });
    mod.captureAccel = new Sk.builtin.func(function(a) {
        captureAccel();
    });
    var captureAccel = function() {
        navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);
    }

    // onSuccess: Get a snapshot of the current acceleration
    //
    var onSuccess = function(acceleration) {
        //alerts does not return[!!!!!!!!!!!!!!!!!!!!]
        console.log('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp: '      + acceleration.timestamp + '\n');
        accelData = [acceleration.x,acceleration.y,acceleration.z]
    };
    var giveAccelData = function(){
        return String(accelData)
    };
    var timeOutGet = function(time){
        return setTimeout(function(){
            alert('test');
        },time);
    };
    
    mod.timeOutGet = new Sk.builtin.func(function(time) {
        return timeOutGet(time);
    });
    /*
    var getAccel = function(fn) {
        var callback = function(acceleration){
            onSuccess(acceleration,fn)
        }
        navigator.accelerometer.getCurrentAcceleration(callback, onError);
    }

    // onSuccess: Get a snapshot of the current acceleration
    //
    var onSuccess = function(acceleration,fn) {
        callback(acceleration.x,acceleration.y,acceleration.z)
        alert('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp: '      + acceleration.timestamp + '\n');
    }*/

    // onError: Failed to get the acceleration
    //

    // onError: Failed to get the acceleration
    //
    var onError = function() {
        alert('onError!');
    };

    var jsGetAccel = function() {
        if (accelData === null){
            setTimeout(jsGetAccel,200)
        }
        return String(accelData);
    }
    
    mod.getAccel = new Sk.builtin.func(function() {
        return String(accelData);
    });
    
    mod.getAccel2 = new Sk.builtin.func(function() {
        return getCapture;
    });
        
    
    var getCapture = function(){
        if(accelData!=null){
            return accelData;
        }else{
            setTimeout(getCapture(),20);
        }
    }
            
    
    mod.sqrt = new Sk.builtin.func(function(x) {
    	return Math.sqrt(x);
        });
    mod.Stack = Sk.misceval.buildClass(mod, function($gbl, $loc) {
         $loc.__init__ = new Sk.builtin.func(function(self) {
             self.stack = [];
         });

         $loc.push = new Sk.builtin.func(function(self,x) {
             self.stack.push(x);
         });
         $loc.pop = new Sk.builtin.func(function(self) {
             return self.stack.pop();
         });
            },
            'Stack', []);

    return mod;
}