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
    'Białystok': {'um': [379, 285], 'coamps': [125, 106], 'capital': false},
    'Bydgoszcz': {'um': [381, 199], 'coamps': [126, 81], 'capital': false},
    'Gdańsk': {'um': [346, 210], 'coamps': [115, 84], 'capital': false},
    'Gorzów Wielkopolski': {'um': [390, 152], 'coamps': [129, 67], 'capital': false},
    'Katowice': {'um': [461, 215], 'coamps': [150, 85], 'capital': false},
    'Kielce': {'um': [443, 244], 'coamps': [145, 94], 'capital': false},
    'Kraków': {'um': [466, 232], 'coamps': [151, 91], 'capital': false},
    'Lublin': {'um': [432, 277], 'coamps': [141, 104], 'capital': false},
    'Łódź': {'um': [418, 223], 'coamps': [137, 88], 'capital': false},
    'Olsztyn': {'um': [363, 240], 'coamps': [120, 93], 'capital': false},
    'Opole': {'um': [449, 196], 'coamps': [146, 80], 'capital': false},
    'Poznań': {'um': [400, 180], 'coamps': [132, 75], 'capital': false},
    'Rzeszów': {'um': [465, 269], 'coamps': [151, 101], 'capital': false},
    'Szczecin': {'um': [370, 142], 'coamps': [123, 63], 'capital': false},
    'Toruń': {'um': [383, 209], 'coamps': [127, 84], 'capital': false},
    'Warszawa': {'um': [406, 250], 'coamps': [133, 96], 'capital': false},
    'Wrocław': {'um': [436, 181], 'coamps': [143, 75], 'capital': false},
    'Zielona Góra': {'um': [412, 155], 'coamps': [135, 68], 'capital': false},

    'Berlin': {'um': [394, 121], 'coamps': [130, 57], 'capital': true},
    'Bratysława': {'um': [519, 179], 'coamps': [167, 75], 'capital': true},
    'Budapeszt': {'um': [537, 216], 'coamps': [-1, -1], 'capital': true},
    'Helsinki': {'um': [182, 299], 'coamps': [65, 111], 'capital': true},
    'Kijów': {'um': [440, 418], 'coamps': [144, 146], 'capital': true},
    'Kiszyniów': {'um': [539, 402], 'coamps': [173, 141], 'capital': true},
    'Kopenhaga': {'um': [305, 115], 'coamps': [103, 55], 'capital': true},
    'Lichtenstein': {'um': [535, 35], 'coamps': [172, 32], 'capital': true},
    'Lublana': {'um': [574, 127], 'coamps': [184, 59], 'capital': true},
    'Mińsk': {'um': [352, 355], 'coamps': [117, 128], 'capital': true},
    'Oslo': {'um': [185, 101], 'coamps': [67, 50], 'capital': true},
    'Praga': {'um': [462, 133], 'coamps': [150, 61], 'capital': true},
    'Ryga': {'um': [272, 294], 'coamps': [93, 109], 'capital': true},
    'Sztokholm': {'um': [209, 203], 'coamps': [74, 82], 'capital': true},
    'Tallinn': {'um': [203, 298], 'coamps': [72, 111], 'capital': true},
    'Wiedeń': {'um': [516, 166], 'coamps': [166, 71], 'capital': true},
    'Wilno': {'um': [334, 316], 'coamps': [112, 116], 'capital': true},
    'Zagrzeb': {'um': [583, 155], 'coamps': [186, 68], 'capital': true}
};

Meteo.prototype.downloadError = function() {};
Meteo.prototype.downloadOk = function() {};

Meteo.prototype.toggleModel = function() {
    if(this.model==='coamps') {
        this.model='um';
    } else {
        this.model='coamps';
    }
    if(this.city!==null) {
        this.update();
    }
    return this.model;
};

Meteo.prototype.getCities = function(capital) {
    var c=Object.keys(this._CITIES).sort(), ret, i;

    if(typeof capital === 'undefined') {
        ret = c;
    } else {
        ret=[];
        for(i=0; i<c.length; i++) {
            if((capital===this._CITIES[c[i]].capital)) {
                ret.push(c[i]); 
            };
        } 
    }
    console.log(ret);
    return ret;
};

Meteo.prototype.update = function() {
    var pos=this._getCityPosition(this.city);
    this.row=pos[0];
    this.col=pos[1];
    this.showImage(true);
};

Meteo.prototype.setCity = function(city) {
    if(!(this._CITIES.hasOwnProperty(city))) {
        console.log('Unknown city!');
        return false;
    }

    this.city=city;
    var pos=this._getCityPosition(city);
    if(this.row===pos[0] && this.col===pos[1]) {
        console.log('Neighter row nor col changed');
        return true;
    }
    this.row=pos[0];
    this.col=pos[1];
    this.showImage(true);
    return true;
};

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
            that.downloadOk();
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
    if(!force && date===this.lastDate) {
        console.log('Date not changed!');
        return;
    }
    this.date=date;
    this.frame.src=this._URLS[this.model]['mgram'].format(this.date, this.row, this.col);

};

//////////////////////////////////////////////////////////////////
var meteo;
var frame;

function createFrame() {
    var frame=document.getElementById('frame');
    if(!frame) {
        frame=document.createElement('IFRAME');
        frame.setAttribute('id', 'frame');
        frame.style.border='none';
        var _orientChange = function() {
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

function retry() {
    meteo.update();
}

function addCities() {
    var _helper = function(ul, c) {
        var i,c;
        for(i=0, len=c.length; i<len; i++) {
            ul.innerHTML+='<li><a href="#" onclick=\'setCity("{0}")\'>{0}</a></li>'.format(c[i]);
        }
    }

    _helper(document.getElementById('citiesUl'), meteo.getCities(false));
    _helper(document.getElementById('capitalsUl'), meteo.getCities(true));
}

function handleVisibilityChange() {
    if(document.hidden) {
        return;
    }
    meteo.showImage(false);
}

function configureButtons() {
    var _setDefaultCity = function() {
        if(!isCityBookmarked()) {
            return;
        }

        if(meteo.city==null) {
            alert('Please choose city');
        } else if(confirm('Set {0} as default city?'.format(meteo.city))) {
            localStorage.setItem('default_city', meteo.city);
            setBookmarkIcon();
        }
    };
    var _toggleModel = function() {
        var modelName=document.getElementById('modelName');
        var curModel=meteo.toggleModel(); 

        modelName.innerHTML=curModel.slice(0,2).toUpperCase();
    };

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

function downloadOk() {
    document.getElementById('errorMsg').style.display='none';
    frame.style.display='block';
}

function downloadError() {
    var div=document.getElementById('errorMsg');
    div.style.display='block';
    frame.style.display='none';
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    frame=createFrame();
    meteo = new Meteo(frame);
    meteo.downloadError=downloadError;
    meteo.downloadOk=downloadOk;
    addCities();
    configureButtons();
    setCity(localStorage.getItem('default_city'));
})
