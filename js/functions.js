//Matteo Vinci, Alessandro Aliberti: VuMeter - Elaborazione dell'audio digitale - Ingegneria del cinema e dei mezzi di comunicazione - 2012-2013


var context;
var spectrumAnalyser;
var javascriptNode;

var analyserView;
var source;
var analyser;
var buffer;
var audioBuffer;

var spectrumViewIndex = 0;
var responseDelay = 300;

$(document).ready(init);

function getUserMedia(dictionary, callback) 
{
    try 
    {
        navigator.webkitGetUserMedia(dictionary, callback);
    } 
    catch (e) 
    {
        alert('webkitGetUserMedia threw exception :' + e);
    }
}

function init() 
{
    var canvas = $('canvas');
    canvas.width   = canvas.clientWidth;
    canvas.height  = canvas.clientHeight;
    
    analyserView = new AnalyserView("spectrumView");
    
    $('#vuView').svg(
    {
        loadURL: 'images/vumeter.svg',
        onLoad: onSvgLoaded
    });
}

 
/* Callback after loading external document */ 
function onSvgLoaded(svg, error) 
{ 
    customLog('loaded');
    
    removeLoader();
    
    var obj = {audio: true};
 
    getUserMedia(obj, gotStream);
    
    $("#spectrumView").click(function()
    {
        toggleSpectrumView();
    });
}

function gotStream(stream)
{
    context = new webkitAudioContext();
    
    spectrumAnalyser = context.createAnalyser();
    
    spectrumAnalyser.fftSize = 2048;
    
    var mediaStreamSource = context.createMediaStreamSource(stream);    
    mediaStreamSource.connect(spectrumAnalyser);
    spectrumAnalyser.connect(context.destination);
    
    javascriptNode = context.createJavaScriptNode(2048, 1, 1);
    mediaStreamSource.connect(javascriptNode);
    javascriptNode.connect(context.destination);
    
    analyserView.initByteBuffer();
    
    javascriptNode.onaudioprocess = onAudioProcessHandler;
}

function getAverageVolume(array) 
{
        var values = 0;
        var average;
 
        var length = array.length;
        
        customLog(array);
 
        // get all values and get Root Mean Square
        for (var i = 0; i < length; i++) 
        {
            values += Math.pow(array[i], 2);
        }
 
        average = Math.sqrt(values / length);
        
//        if(typeof console != "undefined")
//            console.log(average);
        
        return average;
    }
    

function onAudioProcessHandler() 
{
    var freqByteData = new Uint8Array(spectrumAnalyser.frequencyBinCount);
    
    spectrumAnalyser.getByteFrequencyData(freqByteData); 
    
    analyserView.doFrequencyAnalysis();
    
     var avg = getAverageVolume(freqByteData);
     
     var deg = Math.min((65 * avg) / 100, 95);
     
     setTimeout(function()
     {
         if(avg > 100)
         {
             $('#led').attr('fill', '#ea2b2c');
         }
         else
         {
             $('#led').attr('fill', '#992B2C');
         }
         $('#trigger').attr('transform', 'rotate(' + deg + ' 332 372)');
     }, 
     responseDelay);
}

function toggleSpectrumView()
{
    spectrumViewIndex = spectrumViewIndex < 4 ? spectrumViewIndex + 1 : 0;
    analyserView.setAnalysisType(spectrumViewIndex);
}

function removeLoader()
{
    $('#spectrumView').css('background-image', "none");
    $('#vuView').css('background-image', "none");
}

function customLog(msg)
{
    if(typeof console != "undefined")
    {
        console.log(msg);
    }
}
