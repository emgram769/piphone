/* Copyright: Mark Dwyer (markus.dwyer@gmail.com)
 *
 * Date: 21 February, 2012
 * 
 *
 * There is no warranty that it is fit for any particular purpose, or that it 
 * will work at all. You use this source code solely at your own risk, and no 
 * liability can be assumed for any damage or loss incurred 
 * by your use of this software.
 */


// internal vectors and matrices
var ViewMoveMatrix = new Array(12);
var ViewRotationMatrix = new Array(12);
var WorldTransform = new Array(12);

var WorldUp = new Array(3);			
var Position = new Array(3);
var FocalPoint = new Array(3);
var DirectionOfProjection = new Array(3);
var distance;

var PI = 3.14159265358;
var EPSILON_E5 = 1E-5;
			
var viewport_width;
var viewport_height;
var alpha, beta;
var aspect_ratio;
var view_dist;

WorldUp = [0.0, 1.0, 0.0];

function WindowAttr(w, h)
{
	viewport_width = w;
	viewport_height = h;
	aspect_ratio = viewport_width/viewport_height;
	alpha = (0.5*viewport_width-0.5);
	beta  = (0.5*viewport_height-0.5);
	view_dist = (0.5)*2.0*Math.tan( 90.0/2*PI/180.0);; 
}

/*
 * Build a transform as if you were at a point (x1,y1,z1), and
 * looking at a point (x2,y2,z2)
 */
function LookAt(pos, at)
{
	// the View or "new Z" vector
	var ViewOut = new Array(3);
	// the Up or "new Y" vector
	var ViewUp = new Array(3);
	// the Right or "new X" vector
	var ViewRight = new Array(3);

	// for normalizing the View vector
	var ViewMagnitude;
	// for normalizing the Up vector
	var UpMagnitude;
	// magnitude of projection of View Vector on World UP
	var UpProjection;

	Position[0] = pos[0];
	Position[1] = pos[1];
	Position[2] = pos[2];
	
	FocalPoint[0] = at[0];
	FocalPoint[1] = at[1];
	FocalPoint[2] = at[2];
	
	DirectionOfProjection[0] = Position[0] - FocalPoint[0];
	DirectionOfProjection[1] = Position[1] - FocalPoint[1];
	DirectionOfProjection[2] = Position[2] - FocalPoint[2];
	// first, calculate and normalize the view vector
	ViewOut[0] = at[0]-pos[0];
	ViewOut[1] = at[1]-pos[1];
	ViewOut[2] = at[2]-pos[2];
	ViewMagnitude = Math.sqrt(ViewOut[0]*ViewOut[0] + ViewOut[1]*ViewOut[1] + ViewOut[2]*ViewOut[2]);
	distance = ViewMagnitude;

	// invalid points (not far enough apart)
	if (ViewMagnitude < .000001)
		return -1;

	// normalize. This is the unit vector in the "new Z" direction
	ViewOut[0] = ViewOut[0]/ViewMagnitude;
	ViewOut[1] = ViewOut[1]/ViewMagnitude;
	ViewOut[2] = ViewOut[2]/ViewMagnitude;

	
	// Now the hard part: The ViewUp or "new Y" vector

	// dot product of ViewOut vector and World Up vector gives projection of
	// of ViewOut on WorldUp
	UpProjection = ViewOut[0]*WorldUp[0] + ViewOut[1]*WorldUp[1]+
	ViewOut[2]*WorldUp[2];

	// first try at making a View Up vector: use World Up
	ViewUp[0] = WorldUp[0] - UpProjection*ViewOut[0];
	ViewUp[1] = WorldUp[1] - UpProjection*ViewOut[1];
	ViewUp[2] = WorldUp[2] - UpProjection*ViewOut[2];

	// Check for validity:
	UpMagnitude = ViewUp[0]*ViewUp[0] + ViewUp[1]*ViewUp[1] + ViewUp[2]*ViewUp[2];

	if (UpMagnitude < .0000001)
	{
		//Second try at making a View Up vector: Use Y axis default  (0,1,0)
		ViewUp[0] = -ViewOut[1]*ViewOut[0];
		ViewUp[1] = 1-ViewOut[1]*ViewOut[1];
		ViewUp[2] = -ViewOut[1]*ViewOut[2];

		// Check for validity:
		UpMagnitude = ViewUp[0]*ViewUp[0] + ViewUp[1]*ViewUp[1] + ViewUp[2]*ViewUp[2];

		if (UpMagnitude < .0000001)
		{
			//Final try at making a View Up vector: Use Z axis default  (0,0,1)
			ViewUp[0] = -ViewOut[2]*ViewOut[0];
			ViewUp[1] = -ViewOut[2]*ViewOut[1];
			ViewUp[2] = 1-ViewOut[2]*ViewOut[2];

			// Check for validity:
			UpMagnitude = ViewUp[0]*ViewUp[0] + ViewUp[1]*ViewUp[1] + ViewUp[2]*ViewUp[2];

			if (UpMagnitude < .0000001)
				return(-1);
		}
	}

	// normalize the Up Vector
	UpMagnitude = Math.sqrt(UpMagnitude);
	ViewUp[0] = ViewUp[0]/UpMagnitude;
	ViewUp[1] = ViewUp[1]/UpMagnitude;
	ViewUp[2] = ViewUp[2]/UpMagnitude;

	UpVector(ViewUp[0], ViewUp[1], ViewUp[2]);

	// Calculate the Right Vector. Use cross product of Out and Up.
	ViewRight[0] = -ViewOut[1]*ViewUp[2] + ViewOut[2]*ViewUp[1];
	ViewRight[1] = -ViewOut[2]*ViewUp[0] + ViewOut[0]*ViewUp[2];
	ViewRight[2] = -ViewOut[0]*ViewUp[1] + ViewOut[1]*ViewUp[0];

	// Plug values into rotation matrix R
	ViewRotationMatrix[0]=ViewRight[0];
	ViewRotationMatrix[1]=ViewRight[1];
	ViewRotationMatrix[2]=ViewRight[2];
	ViewRotationMatrix[3]=0;

	ViewRotationMatrix[4]=ViewUp[0];
	ViewRotationMatrix[5]=ViewUp[1];
	ViewRotationMatrix[6]=ViewUp[2];
	ViewRotationMatrix[7]=0;

	ViewRotationMatrix[8]=ViewOut[0];
	ViewRotationMatrix[9]=ViewOut[1];
	ViewRotationMatrix[10]=ViewOut[2];
	ViewRotationMatrix[11]=0;

	

	// Plug values into translation matrix T
	ViewMoveMatrix = MoveFill(-pos[0],-pos[1],-pos[2]);

	// build the World Transform
	WorldTransform = MatrixMultiply(ViewRotationMatrix,ViewMoveMatrix);

	return 0;
}


/*
 * A matrix multiplication (dot product) of two 4x4 matrices.
 * Actually, we are only using matrices with 3 rows and 4 columns.
 */
function MatrixMultiply(A, B)
{
  var C = new Array(12);

	C[0] = A[0]*B[0] + A[1]*B[4] + A[2]*B[8];
	C[1] = A[0]*B[1] + A[1]*B[5] + A[2]*B[9];
	C[2] = A[0]*B[2] + A[1]*B[6] + A[2]*B[10];
	C[3] = A[0]*B[3] + A[1]*B[7] + A[2]*B[11] + A[3];

	C[4] = A[4]*B[0] + A[5]*B[4] + A[6]*B[8];
	C[5] = A[4]*B[1] + A[5]*B[5] + A[6]*B[9];
	C[6] = A[4]*B[2] + A[5]*B[6] + A[6]*B[10];
	C[7] = A[4]*B[3] + A[5]*B[7] + A[6]*B[11] + A[7];

	C[8] = A[8]*B[0] + A[9]*B[4] + A[10]*B[8];
	C[9] = A[8]*B[1] + A[9]*B[5] + A[10]*B[9];
	C[10] = A[8]*B[2] + A[9]*B[6] + A[10]*B[10];
	C[11] = A[8]*B[3] + A[9]*B[7] + A[10]*B[11] + A[11];
	return C;
}


/*
 *  Fill the translation matrix
 */
function MoveFill(Cx, Cy, Cz)
{
	var A = new Array(12);
	
	A[0] = 1;   A[1] = 0;   A[2] = 0;   A[3] = Cx;
	A[4] = 0;   A[5] = 1;   A[6] = 0;   A[7] = Cy;
	A[8] = 0;   A[9] = 0;   A[10]= 1;   A[11]= Cz;
	return A;
}


/*
 *
 */
function RotatePoint(p0, axis, theta)
{
	var p1 = new Array(12);
	p1[0] = 0.0;
	p1[1] = 0.0;
	p1[2] = 0.0;
	var costheta,sintheta;
	var r = new Array(3);
	// Normalise axis
	var length = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
	if (length != 0)
	{
		r[0] = axis[0]/length;
		r[1] = axis[1]/length;
		r[2] = axis[2]/length;
	}
	
	costheta = Math.cos(theta);
	sintheta = Math.sin(theta);

	p1[0] += (costheta + (1 - costheta) * r[0] * r[0]) * p0[0];
	p1[0] += ((1 - costheta) * r[0] * r[1] - r[2] * sintheta) * p0[1];
	p1[0] += ((1 - costheta) * r[0] * r[2] + r[1] * sintheta) * p0[2];

	p1[1] += ((1 - costheta) * r[0] * r[1] + r[2] * sintheta) * p0[0];
	p1[1] += (costheta + (1 - costheta) * r[1] * r[1]) * p0[1];
	p1[1] += ((1 - costheta) * r[1] * r[2] - r[0] * sintheta) * p0[2];

	p1[2] += ((1 - costheta) * r[0] * r[2] - r[1] * sintheta) * p0[0];
	p1[2] += ((1 - costheta) * r[1] * r[2] + r[0] * sintheta) * p0[1];
	p1[2] += (costheta + (1 - costheta) * r[2] * r[2]) * p0[2];
	return p1;
}


/*
 *  Change the World Up vector (the default is (0,1,0))
 *  
 */
function UpVector(x, y, z)
{
	WorldUp[0] = x;
	WorldUp[1] = y;
	WorldUp[2] = z;
}


/*
 *
 */
function RotateUp(theta)
{
	// Axis to rotate around - cross camera up and dir
	var axis = new Array(3);
	var newPosition = new Array(3);
	
	// Cross product
	axis[0] = DirectionOfProjection[1]*WorldUp[2] - DirectionOfProjection[2]*WorldUp[1];
	axis[1] = DirectionOfProjection[2]*WorldUp[0] - DirectionOfProjection[0]*WorldUp[2];
	axis[2] = DirectionOfProjection[0]*WorldUp[1] - DirectionOfProjection[1]*WorldUp[0];
	
	// Translate point relative to origin
	Position[0] -= FocalPoint[0];
	Position[1] -= FocalPoint[1];
	Position[2] -= FocalPoint[2];
	newPosition = RotatePoint(Position, axis, theta);
	//ippsCopy_32f(Position, newPosition, 3);
	// Translate point back to world space
	Position[0] = newPosition[0] + FocalPoint[0];
	Position[1] = newPosition[1] + FocalPoint[1];
	Position[2] = newPosition[2] + FocalPoint[2];
	LookAt(Position, FocalPoint);
}


/*
 *
 */
function RotateRight(theta)
{
	var newPosition = new Array(3);
	// Axis to rotate around - up vector
	Position[0] -= FocalPoint[0];
	Position[1] -= FocalPoint[1];
	Position[2] -= FocalPoint[2];
	newPosition = RotatePoint(Position, WorldUp, theta);
	//ippsCopy_32f(Position, newPosition, 3);
	Position[0] = newPosition[0] + FocalPoint[0];
	Position[1] = newPosition[1] + FocalPoint[1];
	Position[2] = newPosition[2] + FocalPoint[2];
	LookAt(Position, FocalPoint);
}


/*
 *
 */
function MoveForward(dist)
{
	Position[0] = FocalPoint[0] + (1.0-dist)*DirectionOfProjection[0];
	Position[1] = FocalPoint[1] + (1.0-dist)*DirectionOfProjection[1];
	Position[2] = FocalPoint[2] + (1.0-dist)*DirectionOfProjection[2];
	LookAt(Position, FocalPoint);
}


/*
 *
 */
function MoveRight(dist)
{
	// the Right or "new X" vector
	var ViewRight = new Array(3);
	// Calculate the Right Vector. Use cross product of Out and Up.
	ViewRight[0] = -DirectionOfProjection[1]*WorldUp[2] + DirectionOfProjection[2]*WorldUp[1];
	ViewRight[1] = -DirectionOfProjection[2]*WorldUp[0] + DirectionOfProjection[0]*WorldUp[2];
	ViewRight[2] = -DirectionOfProjection[0]*WorldUp[1] + DirectionOfProjection[1]*WorldUp[0];

	Position[0] += ViewRight[0]*dist;
	Position[1] += ViewRight[1]*dist;
	Position[2] += ViewRight[2]*dist;
	
	FocalPoint[0] += ViewRight[0]*dist;
	FocalPoint[1] += ViewRight[1]*dist;
	FocalPoint[2] += ViewRight[2]*dist;
	
	LookAt(Position, FocalPoint);
}

/*
 *
 */
function MoveUp(dist)
{
	Position[0] += WorldUp[0]*dist*distance;
	Position[1] += WorldUp[1]*dist*distance;
	Position[2] += WorldUp[2]*dist*distance;
	
	FocalPoint[0] += WorldUp[0]*dist*distance;
	FocalPoint[1] += WorldUp[1]*dist*distance;
	FocalPoint[2] += WorldUp[2]*dist*distance;
	
	LookAt(Position, FocalPoint);
}
