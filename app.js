var UPDATE_INTERVAL=(1000*60*60);   // 1h
var cities={
    'Białystok': [379, 285],
    'Wrocław': [436, 181],
}

function createFrame() {
    var frame=document.getElementById('frame');
    if(!frame) {
        var frame=document.createElement("IFRAME");
        frame.setAttribute('id', 'frame');
        frame.setAttribute('lastDate', '0');
        frame.setAttribute('lastUpdate', '0');
        frame.setAttribute('lastRow', '-1');
        frame.setAttribute('lastCol', '-1');
        frame.style.border='none';
        function _orientChange() {
            frame.style.width=window.screen.width+'px';
            frame.style.height=window.screen.height+'px';
        };
        screen.addEventListener("mozorientationchange", _orientChange);
        _orientChange();
        document.getElementById('mainDiv').appendChild(frame);
    }
    return frame;
}

function loadImage(frame, date, row, col) {
    var lastDate=frame.getAttribute('lastDate');

    if(date==lastDate) {
        console.log("Date not changed!");
        return;
    }

    frame.setAttribute('lastDate', date);
    frame.src='http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate='+date+'&row='+row+'&col='+col+'&lang=pl';
}

function showImage() {
    var frame=createFrame();
    var lastUpdate=frame.getAttribute('lastUpdate');
    var row=frame.getAttribute('lastRow');
    var col=frame.getAttribute('lastCol');

    var time = (new Date()).getTime();
    if((time-lastUpdate)<UPDATE_INTERVAL) {
        console.log("To soon!");
        return;
    }

    var xmlhttp=new XMLHttpRequest({mozSystem: true});
    xmlhttp.open("GET",'http://www.meteo.pl/meteorogram_um_js.php',true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
            var date=/UM_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
            loadImage(frame, date, row, col);
            frame.setAttribute('lastUpdate', time);
        }
    };
    xmlhttp.onerror = function () { alert("Can't download"); };
    xmlhttp.send();
}

function setPosition(row, col) {
    var frame=createFrame();
    var lastRow=frame.getAttribute('lastRow');
    var lastCol=frame.getAttribute('lastCol');
    if(lastRow==row && lastCol==col) {
        console.log('Neighter row nor col changed');
        return;
    }
    frame.setAttribute('lastUpdate', 0);
    frame.setAttribute('lastDate', 0);
    lastRow=frame.setAttribute('lastRow', row);
    lastCol=frame.setAttribute('lastCol', col);
    showImage();
}

function addCities() {
    var ul=document.getElementById('citiesUl');
    var cityNames=Object.keys(cities).sort();
    for(var i=0, len=cityNames.length; i<len; i++) {
        var c=cityNames[i];
        ul.innerHTML+='<li><a href="#" onclick=\'setCity("'+c+'")\'>'+c+'</a></li>';
    }
}

function setCity(city) {
    document.getElementById('mainTitle').innerHTML=city;
    setPosition.apply(null, cities[city]);
}

function handleVisibilityChange() {
    if(document.hidden) {
        return;
    }
    showImage();
}

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    addCities();
    setCity('Wrocław');
})
