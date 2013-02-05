# VIEWS
# This file handles actual server requests in various ways.

from flask import render_template, request
from app import app
from subprocess import Popen, PIPE
import numpy
from crossdomain import crossdomain
import base64
import time
        
def loadExecuteCode(data): #creates a file that is executed with popen
    if 'bugCode' in data:
        return dealWithBugs(data)
    elif 'code' in data:
        code = data['code']
        with open('runCode.py', 'w') as testInput:
            loadLocalVariables(data)
            testInput.write('from variableData import *\n')
            testInput.write(code)
        print data['key']
        if data['key'] == 'supersecretpassword':
            output = Popen(
                #Pipes the output of the code to the phone
                #This handles strings only and is done in other cases too
                ['python','pipeRunCode.py'],stdout=PIPE).stdout.read()
        else:
            output = "Incorrect password, please reconnect\n"
        return output
    else:
        print data
        return "Did not recieve code data."

def dealWithBugs(data): #automatic error handling, feeds back errors
    print data['bugCode'] #for server viewing
    with open('testOutput.py', 'w') as testInput:
        testInput.write(data['bugCode'])
    #basic security measure
    if data['key'] == 'supersecretpassword':
        output = Popen(
            ['python','pipe.py'],stdout=PIPE).stdout.read()
    else:
        output = "Incorrect password, please reconnect\n"
    return output
    
def loadLocalVariables(package): #creates a file containing necessary data
    with open('variableData.py','w') as variableData:
        for key in package:
            #avoids keywords
            if key!='code' and key!='bugCode' and key!='key':
                print package[key], package[key].isdigit()
                if package[key].isdigit():
                    variableData.write(key+'='+package[key]+'\n')
                else:
                    variableData.write(key+'=\''+package[key]+'\''+'\n')

def savePhoto(name,data): #converts base64 image files to jpeg
    try:
        with open('tmp/'+name+".jpg", "w") as recovered:
            recovered.write(data.decode('base64'))
        return "Success saving "+name+".jpg"
    except Exception as e:
        print 'savePhoto: ',e
        return 'Error saving data'

@app.route('/image',methods = ['GET','POST']) #handles image requests
@crossdomain(origin='*')
def imageSave():
    try:
        return savePhoto(request.form['name'],request.form['data'])
    except:
        return "Error: could not save data."


@app.route('/testing',methods = ['GET','POST']) #handles server tests
@crossdomain(origin='*')
def printWhatIGot():
    for key in request.form:
        if request.form[key].isdigit():
            print key,'=', request.form[key]
        else:
            print key,'= \''+request.form[key]+'\''
    return 'Success!'

@app.route('/visualoutput') #Anything contained in the HTML
def streamFromHTML5():
    return render_template('visualoutput.html')



@app.route('/', methods = ['GET', 'POST']) #main package handler
@app.route('/code', methods = ['GET', 'POST']) #alternate URL
@crossdomain(origin='*')
def runCode():
    try:
        return loadExecuteCode(request.form)
    except Exception as e:
        print 'runCode: ',e
        return e