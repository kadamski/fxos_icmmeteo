var Meteo = (function () {
    'use strict';

    var _frame;
    var _city=null;
    var _model='um';
    var _lastUpdate='0';
    var _lastDate='0';
    var _row='-1';
    var _col='-1';
    var _lang='pl';

    var UPDATE_INTERVAL=(1000*60*60);

    var URLS = {
        'um': {
            'mgram': 'http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate={0}&row={1}&col={2}&lang={3}',
            'date': 'http://www.meteo.pl/meteorogram_um_js.php'
        },
        'coamps': {
            'mgram': 'http://www.meteo.pl/metco/mgram_pict.php?ntype=2n&fdate={0}&row={1}&col={2}&lang={3}',
            'date': 'http://www.meteo.pl/meteorogram_coamps_js.php'
        }
    };

    var CITIES = {
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
        'Bratislava': {'um': [519, 179], 'coamps': [167, 75], 'capital': true},
        'Budapest': {'um': [537, 216], 'coamps': [-1, -1], 'capital': true},
        'Helsinki': {'um': [182, 299], 'coamps': [65, 111], 'capital': true},
        'Kiev': {'um': [440, 418], 'coamps': [144, 146], 'capital': true},
        'Kishinev': {'um': [539, 402], 'coamps': [173, 141], 'capital': true},
        'Copenhagen': {'um': [305, 115], 'coamps': [103, 55], 'capital': true},
        'Lichtenstein': {'um': [535, 35], 'coamps': [172, 32], 'capital': true},
        'Ljubljana': {'um': [574, 127], 'coamps': [184, 59], 'capital': true},
        'Minsk': {'um': [352, 355], 'coamps': [117, 128], 'capital': true},
        'Oslo': {'um': [185, 101], 'coamps': [67, 50], 'capital': true},
        'Prague': {'um': [462, 133], 'coamps': [150, 61], 'capital': true},
        'Ryga': {'um': [272, 294], 'coamps': [93, 109], 'capital': true},
        'Stockholm': {'um': [209, 203], 'coamps': [74, 82], 'capital': true},
        'Tallinn': {'um': [203, 298], 'coamps': [72, 111], 'capital': true},
        'Viena': {'um': [516, 166], 'coamps': [166, 71], 'capital': true},
        'Vilnius': {'um': [334, 316], 'coamps': [112, 116], 'capital': true},
        'Zagreb': {'um': [583, 155], 'coamps': [186, 68], 'capital': true}
    };

    var toggleModel = function() {
        if(_model==='coamps') {
            _model='um';
        } else {
            _model='coamps';
        }
        if(_city!==null) {
            update();
        }
        return _model;
    };

    var getCities = function(capital) {
        var cities, ret, i;

        cities=Object.keys(CITIES).sort();

        if(capital === undefined) {
            ret = cities;
        } else {
            ret=[];
            for(i=0; i<cities.length; i++) {
                if((capital===CITIES[cities[i]].capital)) {
                    ret.push(cities[i]); 
                }
            } 
        }
        console.log(ret);
        return ret;
    };

    var update = function() {
        var pos=_getCityPosition(_city);
        _row=pos[0];
        _col=pos[1];
        showImage(true);
    };

    var setCity = function(city) {
        var pos;

        if(!(CITIES.hasOwnProperty(city))) {
            console.log('Unknown city!');
            return false;
        }

        _city=city;
        pos=_getCityPosition(city);
        if(_row===pos[0] && _col===pos[1]) {
            console.log('Neighter row nor col changed');
            return true;
        }
        _row=pos[0];
        _col=pos[1];
        showImage(true);
        return true;
    };

    var showImage=function(force) {
        var time, xmlhttp;
        time = (new Date()).getTime();
        if(!currentCity()) {
            console.log('No city choosen!');
            return;
        }

        if(!force && (time-_lastUpdate)<UPDATE_INTERVAL) {
            console.log('To soon!');
            return;
        }

        if(navigator.onLine===false) {
            _frame.dispatchEvent(new Event('downloadError'));
            return;
        }

        xmlhttp=new XMLHttpRequest({mozSystem: true});
        xmlhttp.open('GET', URLS[_model].date, true);
        xmlhttp.onreadystatechange = function () {
            if(xmlhttp.readyState !== 4) {
                return;
            }
            if (xmlhttp.status === 200) {
                var date=/_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
                _loadImage(date, force);
                _lastUpdate=time;
                _frame.dispatchEvent(new Event('downloadOk'));
            } else {
                this.onerror();
            }
        };
        xmlhttp.onerror = function() { _frame.dispatchEvent(new Event('downloadError')); };
        xmlhttp.send();
    };

    var currentCity = function() {
        return _city;
    };

    var _getCityPosition = function(city) {
        return CITIES[city][_model];
    };

    var _loadImage = function(date, force) {
        if(!force && date===_lastDate) {
            console.log('Date not changed!');
            return;
        }
        _frame.src=URLS[_model].mgram.format(date, _row, _col, _lang, _city);
    };

    return (function (frame) {
        _frame=frame;
        return {
            showImage: showImage,
            setCity: setCity,
            update: update,
            getCities: getCities,
            toggleModel: toggleModel,
            currentCity: currentCity
        };
    });
}());
