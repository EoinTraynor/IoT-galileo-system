var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

// require npm socket.io-client module
// Establish connection via web-socket to receiver's local server
var socketClient = require('socket.io-client');
var socket = socketClient.connect('http://192.168.30.55:3000', {reconnect: true});

socket.on('connect', function(socket){
    console.log('Clinet Connecting');
});

var lastBtnVal;

// identify digital button input and analog inputs of the button and the
var btnPin = new mraa.Gpio(5);
var tempPin = new mraa.Aio(0);
// must specify the direction (read/write) of the digital button
btnPin.dir(mraa.DIR_IN);

function periodicActivity(){

    // read the analog value of the temperature pin
    var tempValue = tempPin.read();
    // send data to receiver specifing a name of the object being passed
    // send value of the sensor in the object
    socket.emit('motor power', {value: tempValue, userId: "Eoin"});

    // read the digital value of the button pin
    var btnValue = btnPin.read();
    console.log('Bnt Value is ' + btnValue);
    // identify when each button press is a seperate update
    if (btnValue === 1 && btnValue != lastBtnVal) {
        console.log("value is true");
        // send data to receiver specifing a name of the object being passed
        // send value of the sensor in the object
        socket.emit('toggle power', {value: 0, userId: "Eoin"});
    }
    lastBtnVal = btnValue;

    // loop over function every second
    setTimeout(periodicActivity, 1000);
}

// require npm weater-js module
var weather = require('weather-js');

function getWeather() {
    // specify the location and the degree type of the request
    weather.find({search: 'Dublin, Ireland', degreeType: 'C'}, function(err, result) {
        // return if error occurs
        if (err) {console.log(err);}
        // conver result to a JSON string
        var weatherDetails = JSON.stringify(result, null, 2);
        console.log(weatherDetails);
        // send the JSON string to the reciever
        socket.emit('weather', {value: result, userId: "Eoin"});
    });
    // this information sould be updated every minute
    setTimeout(getWeather, 60000);
}

periodicActivity();
getWeather();
