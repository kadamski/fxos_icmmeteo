var URLS = {
    'um': {
        'mgram': 'http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate={0}&row={1}&col={2}&lang=pl',
        'date': 'http://www.meteo.pl/meteorogram_um_js.php'
    },
    'coamps': {
        'mgram': 'http://www.meteo.pl/metco/mgram_pict.php?ntype=2n&fdate={0}&row={1}&col={2}&lang=pl',
        'date': 'http://www.meteo.pl/meteorogram_coamps_js.php'
    }
};

var UPDATE_INTERVAL=(1000*60*60);   // 1h
var cities={
    'Białystok': {'um': [379, 285], 'coamps': [125, 106]},
    'Bydgoszcz': {'um': [381, 199], 'coamps': [126, 81]},
    'Gdańsk': {'um': [346, 210], 'coamps': [115, 84]},
    'Gorzów Wielkopolski': {'um': [390, 152], 'coamps': [129, 67]},
    'Katowice': {'um': [461, 215], 'coamps': [150, 85]},
    'Kielce': {'um': [443, 244], 'coamps': [145, 94]},
    'Kraków': {'um': [466, 232], 'coamps': [151, 91]},
    'Lublin': {'um': [432, 277], 'coamps': [141, 104]},
    'Łódź': {'um': [418, 223], 'coamps': [137, 88]},
    'Olsztyn': {'um': [363, 240], 'coamps': [120, 93]},
    'Opole': {'um': [449, 196], 'coamps': [146, 80]},
    'Poznań': {'um': [400, 180], 'coamps': [132, 75]},
    'Rzeszów': {'um': [465, 269], 'coamps': [151, 101]},
    'Szczecin': {'um': [370, 142], 'coamps': [123, 63]},
    'Toruń': {'um': [383, 209], 'coamps': [127, 84]},
    'Warszawa': {'um': [406, 250], 'coamps': [133, 96]},
    'Wrocław': {'um': [436, 181], 'coamps': [143, 75]},
    'Zielona Góra': {'um': [412, 155], 'coamps': [135, 68]}
}
var curCity=null;
var curModel='um';

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
    frame.src=URLS[curModel]['mgram'].format(date, row, col);
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
    xmlhttp.open("GET", URLS[curModel]['date'], true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
            var date=/_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
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
    if(cities[city]!=undefined) {
        curCity=city;
        document.getElementById('mainTitle').innerHTML=city;
        document.getElementById('noCityMsg').style.display="none";
        setPosition.apply(null, cities[city][curModel]);
    } else {
        document.getElementById('noCityMsg').style.display="block";
    }
}

function handleVisibilityChange() {
    if(document.hidden) {
        return;
    }
    showImage();
}


function configureButtons() {
    function _setDefaultCity() {
        if(curCity==null) {
            alert("Please choose city");
        } else if(confirm("Set {0} as default city?".format(curCity))) {
            localStorage.setItem("default_city", curCity);
        }
    }

    var setDefaultBtn = document.getElementById('startingCityBtn');
    setDefaultBtn.addEventListener("click", _setDefaultCity);
    var toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.addEventListener("click", toggleModel);
}

function toggleModel() {
    var modelName=document.getElementById('modelName');
    if(curModel=='coamps') {
        curModel='um';
    } else {
        curModel='coamps';
    }
    modelName.innerHTML=curModel.slice(0,2).toUpperCase();

    var frame=createFrame();
    frame.setAttribute('lastUpdate', '0');
    frame.setAttribute('lastDate', '0');
    setCity(curCity);
}

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    addCities();
    configureButtons();
    setCity(localStorage.getItem("default_city"));
})
