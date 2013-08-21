function Meteo(frame) {
    this.frame=frame;
    this.city=null;
    this.model='um';
    this.lastUpdate='0';
    this.lastDate='0';
    this.row='-1';
    this.col='-1';
}

Meteo.prototype.UPDATE_INTERVAL=(1000*60*60);

Meteo.prototype._URLS = {
    'um': {
        'mgram': 'http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate={0}&row={1}&col={2}&lang=pl',
        'date': 'http://www.meteo.pl/meteorogram_um_js.php'
    },
    'coamps': {
        'mgram': 'http://www.meteo.pl/metco/mgram_pict.php?ntype=2n&fdate={0}&row={1}&col={2}&lang=pl',
        'date': 'http://www.meteo.pl/meteorogram_coamps_js.php'
    }
};

Meteo.prototype._CITIES = {
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
};

Meteo.prototype.downloadError = function() {};

Meteo.prototype.toggleModel = function() {
    var modelName=document.getElementById('modelName');
    if(this.model=='coamps') {
        this.model='um';
    } else {
        this.model='coamps';
    }
    if(this.city!==null) {
        this.update();
    }
    return this.model;
};

Meteo.prototype.getCities = function() {
    return Object.keys(this._CITIES).sort();
};

Meteo.prototype.update = function() {
    var pos=this._getCityPosition(this.city);
    this.row=pos[0];
    this.col=pos[1];
    this.showImage(true);
};

Meteo.prototype.setCity = function(city) {
    if(!(city in this._CITIES)) {
        console.log('Unknown city!');
        return false;
    }

    this.city=city;
    var pos=this._getCityPosition(city);
    if(this.row==pos[0] && this.col==pos[1]) {
        console.log('Neighter row nor col changed');
        return true;
    }
    this.row=pos[0];
    this.col=pos[1];
    this.showImage(true);
    return true;
}

Meteo.prototype.showImage=function(force) {
    var time = (new Date()).getTime();

    if(!force && (time-this.lastUpdate)<this.UPDATE_INTERVAL) {
        console.log('To soon!');
        return;
    }

    if(navigator.onLine===false) {
        this.downloadError();
        return;
    }

    var xmlhttp=new XMLHttpRequest({mozSystem: true});
    var that=this;
    xmlhttp.open('GET', this._URLS[this.model]['date'], true);
    xmlhttp.onreadystatechange = function () {
        if(xmlhttp.readyState !== 4) {
            return;
        }
        if (xmlhttp.status === 200) {
            var date=/_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
            that._loadImage(date, force);
            that.lastUpdate=time;
        } else {
            this.onerror();
        }
    };
    xmlhttp.onerror = this.downloadError;
    xmlhttp.send();
};

Meteo.prototype._getCityPosition = function(city) {
    return this._CITIES[city][this.model];
};

Meteo.prototype._loadImage = function(date, force) {
    if(!force && date==this.lastDate) {
        console.log('Date not changed!');
        return;
    }
    this.date=date;
    this.frame.src=this._URLS[this.model]['mgram'].format(this.date, this.row, this.col);

};

//////////////////////////////////////////////////////////////////
var meteo;

function createFrame() {
    var frame=document.getElementById('frame');
    if(!frame) {
        var frame=document.createElement('IFRAME');
        frame.setAttribute('id', 'frame');
        frame.style.border='none';
        function _orientChange() {
            var header=document.getElementById('sidebar_title');
            frame.style.width=window.screen.width+'px';
            frame.style.height=(window.screen.height-header.clientHeight-10)+'px';
        };
        screen.addEventListener('mozorientationchange', _orientChange);
        _orientChange();
        document.getElementById('mainDiv').appendChild(frame);
    }
    return frame;
}

function downloadError() {
    var html="Error downloading meteogram."
    html+="<button id=retry onclick=retry()>retry</button>";
    var div=document.getElementById('errorMsg');
    div.innerHTML=html;
}

function retry() {
    document.getElementById('errorMsg').innerHTML="";
    meteo.update();
}

function addCities() {
    var ul=document.getElementById('citiesUl');
    var cityNames=meteo.getCities();
    for(var i=0, len=cityNames.length; i<len; i++) {
        var c=cityNames[i];
        ul.innerHTML+='<li><a href="#" onclick=\'setCity("{0}")\'>{0}</a></li>'.format(c);
    }
}

function handleVisibilityChange() {
    if(document.hidden) {
        return;
    }
    meteo.showImage(false);
}

function configureButtons() {
    function _setDefaultCity() {
        if(isCityBookmarked()) {
            ;
        } else if(meteo.city==null) {
            alert('Please choose city');
        } else if(confirm('Set {0} as default city?'.format(meteo.city))) {
            localStorage.setItem('default_city', meteo.city);
            setBookmarkIcon();
        }
    }
    function _toggleModel() {
        var modelName=document.getElementById('modelName');
        var curModel=meteo.toggleModel(); 

        modelName.innerHTML=curModel.slice(0,2).toUpperCase();
    }

    var setDefaultBtn = document.getElementById('startingCityBtn');
    setDefaultBtn.addEventListener('click', _setDefaultCity);
    var toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.addEventListener('click', _toggleModel);
}

function badCity() {
    document.getElementById('noCityMsg').style.display='block';
    document.getElementById('buttons').style.display='none';
}

function isCityBookmarked() {
    return (meteo.city && meteo.city==localStorage.getItem('default_city'));
}

function setBookmarkIcon() {
    var bookmarkIcon=document.getElementById('bookmarkIcon');
    var c;
    if(isCityBookmarked()) {
        c="icon action-icon bookmarked";
    } else {
        c="icon action-icon bookmark";
    }
    bookmarkIcon.setAttribute("class", c);
}

function setCity(city) {
    if(!meteo.setCity(city)) {
        badCity();
        return;
    }
    document.getElementById('mainTitle').innerHTML=city;
    document.getElementById('noCityMsg').style.display='none';
    document.getElementById('buttons').style.display='block';
    setBookmarkIcon();
}

function downloadError() {
    var html="Error downloading meteogram."
    html+="<button id=retry onclick=retry()>retry</button>";
    var div=document.getElementById('errorMsg');
    div.innerHTML=html;
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    var frame=createFrame();
    meteo = new Meteo(frame);
    meteo.downloadError=downloadError;
    addCities();
    configureButtons();
    setCity(localStorage.getItem('default_city'));
})
