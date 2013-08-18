var MGRAM_URL='http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate={0}&row={1}&col={2}&lang=pl';
var DATE_URL='http://www.meteo.pl/meteorogram_um_js.php'
var UPDATE_INTERVAL=(1000*60*60);   // 1h
var cities={
    'Białystok': [379, 285],
    'Bydgoszcz': [381, 199],
    'Gdańsk': [346, 210],
    'Gorzów Wielkopolski': [390, 152],
    'Katowice': [461, 215],
    'Kielce': [443, 244],
    'Kraków': [466, 232],
    'Lublin': [432, 277],
    'Łódź': [418, 223],
    'Olsztyn': [363, 240],
    'Opole': [449, 196],
    'Poznań': [400, 180],
    'Rzeszów': [465, 269],
    'Szczecin': [370, 142],
    'Toruń': [383, 209],
    'Warszawa': [406, 250],
    'Wrocław': [436, 181],
    'Zielona Góra': [412, 155]
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
            var header=document.getElementById('sidebar_title');
            frame.style.width=window.screen.width+'px';
            frame.style.height=(window.screen.height-header.clientHeight-10)+'px';
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
    frame.src=MGRAM_URL.format(date, row, col);
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
    xmlhttp.open("GET", DATE_URL, true);
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
        ul.innerHTML+='<li><a href="#" onclick=\'setCity("{0}")\'>{0}</a></li>'.format(c);
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
