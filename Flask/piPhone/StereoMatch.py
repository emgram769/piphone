#This is essentially a spruced up version of a sample of stereo_matching

import numpy as np
import cv2
import cv

class PointMaker(object): #for use in other 3d modeling programs
    def __init__(self,filename, vertices):
        self.verts = vertices
        self.filename = filename
    def writePoints(self): #creates a .js file for webviewing
        print 'writing PLY output file...'
        with open(self.filename,'w') as f:
            f.write('var points = [\n')
            for data in self.verts:
                for i in data: #formats for JS, ugly but does the job quickly
                    f.write(str([float('%.6f' %(j)) for j in list(i)])+',\n')
            f.write('];')
        print 'External visual produced!'


class Make3D(object):
    def __init__(self,filename,imageL='tmp/inputL.jpg',imageR='tmp/inputR.jpg'):
        print 'model created'
        self.filename = filename
        try: #make sure OpenCV can actually process the images
            self.testL = cv2.pyrDown(cv2.imread(imageL))
            self.testR = cv2.pyrDown(cv2.imread(imageR))
            assert (self.testR.size == self.testL.size)
            self.width,self.height = self.testL.shape[:2] #scales down
            
            
            #convert image to smaller size
            loadedImageL = cv.LoadImage(imageL,cv.CV_LOAD_IMAGE_COLOR)
            destL = cv.CreateImage((self.height,self.width), 8, 3)
            # 8 = bits, 3 = color
            cv.Resize(loadedImageL,destL,interpolation=cv.CV_INTER_AREA)
            cv.SaveImage(imageL, destL)
            
            #convert image to smaller size
            loadedImageR = cv.LoadImage(imageR,cv.CV_LOAD_IMAGE_COLOR)
            destR = cv.CreateImage((self.height,self.width), 8, 3)
            cv.Resize(loadedImageR,destR,interpolation=cv.CV_INTER_AREA)
            cv.SaveImage(imageR, destR)
            
            self.imageL = cv2.pyrDown(cv2.imread(imageL))
            self.imageR = cv2.pyrDown(cv2.imread(imageR))
        except Exception as e:
            print e
            quit()
    #sets up the images for processing by openCV
    def setImageOptions(self,windowSize,minDisparity,numDisparities):
        self.stereo = cv2.StereoSGBM(minDisparity = minDisparity, 
            numDisparities = numDisparities, 
            SADWindowSize = windowSize,
            uniquenessRatio = 10,
            speckleWindowSize = 100,
            speckleRange = 32,
            disp12MaxDiff = 1,
            P1 = 8*3*windowSize**2,
            P2 = 32*3*windowSize**2,
            fullDP = False
        )
        print 'set image options'
        
    def computeDisparityMap(self):
        print "computing disparity map..."
        self.disparityMap = self.stereo.compute(self.imageL, 
                                                self.imageR
                                                ).astype(np.float32)/16
        self.width,self.height = self.imageL.shape[:2]
        #Based on iphone 4S data I found online
        #half of maximum fstop
        self.focalLength = 1.2*self.width
        #only takes numpy arrays
        #Found this matrix online, adjusted a little to my needs
        self.transformation =np.float32(
                        [[1, 0, 0, -0.5*self.width],
                        [0,-1, 0,  0.5*self.height], 
                        [0, 0, 0,     -self.focalLength],
                        [0, 0, 1,      0]])
        
    def projectTo3D(self):
        #openCV to make into a 3D image for writing later
        print 'creating 3d projection...'
        self.pointCloud = cv2.reprojectImageTo3D(
                            self.disparityMap,
                            self.transformation,
                            handleMissingValues=0)

    def toOutput(self):
        return (self.filename, self.pointCloud)
        
#Model handling
model = Make3D('app/static/Points.js')
model.setImageOptions(3,16,96) #arbitrary but have been tuned
model.computeDisparityMap()
model.projectTo3D()

output = model.toOutput() #returns as tuple
pointMaker = PointMaker(*output) #decomosed tuple
pointMaker.writePoints()
        
        
