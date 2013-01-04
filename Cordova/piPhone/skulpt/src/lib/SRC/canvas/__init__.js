//Canvas

var $builtinmodule = function(name)
{
    var mod = {};

/*
*************************************************************
This is the JavaScript functions part of the __init__.js file
*************************************************************
*/

function setup(x,y)
{


    var fov = 250;

    var SCREEN_WIDTH = x; 
    var SCREEN_HEIGHT = y; 

    var HALF_WIDTH = SCREEN_WIDTH/2; 
    var HALF_HEIGHT = SCREEN_HEIGHT/2; 

    var numPoints = 200; 
    
    var mouseX = 0; 
    var mouseY = -200;

    function draw3Din2D(point3d)
    {  
    	x3d = point3d[0];
    	y3d = point3d[1]; 
    	z3d = point3d[2]; 
    	var scale = fov/(fov+z3d); 
    	var x2d = (x3d * scale) + HALF_WIDTH;	
    	var y2d = (y3d * scale)  + HALF_HEIGHT;


    	c.lineWidth= scale; 
    	c.strokeStyle = "rgb(255,255,255)"; 	
    	c.beginPath();
    	c.moveTo(x2d,y2d); 
    	c.lineTo(x2d+scale,y2d); 
    	c.stroke(); 

    }

    var canvas = document.getElementById('myCanvas');
    var c = canvas.getContext('2d');

    var points = [];

    function initPoints()
    {
    	for (i=0; i<numPoints; i++)
    	{
    		point = [(Math.random()*400)-200, (Math.random()*400)-200 , (Math.random()*400)-200 ];
    		points.push(point); 
    	}

    }

    function render() 
    {

    	c.fillStyle="rgb(0,0,0)";
      	c.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT);

    	for (i=0; i<numPoints; i++)
    	{
            updateMouse()
    		point3d = points[i]; 
            rotatePointAroundY(point3d, mouseX*-0.0003); 
    		point3d[2] += (mouseY*0.08);
    		
    		if(point3d[0]<-300) point3d[0] = 300; 
    		else if(point3d[0]>300) point3d[0] = -300; 
    		if(point3d[2]<-fov) point3d[2] = fov; 
    		else if(point3d[2]>249) point3d[2] = -249;


    		draw3Din2D(point3d); 

    	}
    }
    function rotatePointAroundY(point3d, angle)
    {
    	x = point3d[0]; 
    	z = point3d[2]+fov; 

    	cosRY = Math.cos(angle);
    	sinRY = Math.sin(angle);
    	tempz = z; 
    	tempx = x; 


    	x= (tempx*cosRY)+(tempz*sinRY);
    	z= (tempx*-sinRY)+(tempz*cosRY);
    	point3d[0] = x; 
    	point3d[2] = z-fov; 
    }

    function updateMouse() 
    {
    	//alert(c+" "+c.offsetLeft); 
    	mouseX = 50*(5-accelData[0]); 
    	mouseY = 50*(10-accelData[1]); 
    }
    initPoints();

    var loop = setInterval(function(){render();}, 50);

}

/*
*************************************************************
This is the Python functions part of the __init__.js file
*************************************************************
*/   

    mod.createCanvas = new Sk.builtin.func(function(canvasName,canvasWidth,
                                                            canvasHeight)
    {
        document.getElementById('visualOutput').innerHTML = ("<canvas
         id=\""+canvasName.v+"\" width=\""+canvasWidth+"\" height=\""+
         canvasHeight+"\" style=\"border:1px solid #c3c3c3;\"></canvas>")
    });
    
    mod.drawRectangle = new Sk.builtin.func(function(canvasName,x0,y0,x1,y1,
                                                                        fill)
    {
        var c=document.getElementById(canvasName.v);
        var ctx=c.getContext("2d");
        if(typeof fill === 'undefined'){
           var fill;
           fill = "#000000"; 
        };
        ctx.fillStyle = fill.v;
        ctx.fillRect(x0,y0,x1,y1);
    });
    
    mod.drawLine = new Sk.builtin.func(function(canvasName,x0,y0,x1,y1,fill,
                                                                    width)
    {
        var c=document.getElementById(canvasName.v);
        var ctx=c.getContext("2d");
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        if(typeof fill === 'undefined'){
           var fill;
           fill = "#000000"; 
        };
        width = typeof width !== 'undefined' ? width : 2;
        ctx.strokeStyle = fill.v;
        ctx.lineWidth = width;
        ctx.stroke();
    });
    
    mod.drawCircle = new Sk.builtin.func(function(canvasName,x0,y0,radius,fill)
    {
        var c=document.getElementById(canvasName.v);
        var ctx=c.getContext("2d");
        ctx.beginPath();
        start = 0;
        stop = 2*Math.PI;
        if(typeof fill === 'undefined'){
           var fill;
           fill = "#000000"; 
        };
        ctx.fillStyle = fill.v;
        ctx.arc(x0,y0,radius,start,stop);
        ctx.closePath();
        ctx.fill();
    });

    mod.drawCircleOutline = new Sk.builtin.func(function(canvasName,x0,y0,radius,width,fill){
        var c=document.getElementById(canvasName.v);
        var ctx=c.getContext("2d");
        ctx.beginPath();
        start = 0;
        stop = 2*Math.PI;
        if(typeof fill === 'undefined'){
           var fill;
           fill = "#000000"; 
        };
        width = typeof width !== 'undefined' ? width : 2;
        ctx.fillStyle = null;
        ctx.strokeStyle = fill.v;
        ctx.arc(x0,y0,radius,start,stop);
        ctx.stroke();
    });
    
    mod.drawArc = new Sk.builtin.func(function(canvasName,x0,y0,radius,start,stop,width,fill){
        var c=document.getElementById(canvasName.v);
        var ctx=c.getContext("2d");
        ctx.beginPath();
        start = typeof start !== 'undefined' ? start : 0;
        stop = typeof stop !== 'undefined' ? stop : 2*Math.PI;
        if(typeof fill === 'undefined'){
           var fill;
           fill = "#000000"; 
        };
        width = typeof width !== 'undefined' ? width : 2;
        ctx.fillStyle = null;
        ctx.strokeStyle = fill.v;
        ctx.arc(x0,y0,radius,start,stop);
        ctx.stroke();
    });

    mod.drawSpace = new Sk.builtin.func(function(x,y){
        setup(x,y);
    });



    return mod;
}