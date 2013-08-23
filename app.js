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
    var _about = function() {
        alert("ICM Meteo by Krzysztof Adamski <k@japko.eu>");
    };

    var setDefaultBtn = document.getElementById('startingCityBtn');
    setDefaultBtn.addEventListener('click', _setDefaultCity);
    var toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.addEventListener('click', _toggleModel);
    var aboutBtn = document.getElementById('aboutBtn');
    aboutBtn.addEventListener('click', _about);
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
    frame.addEventListener('downloadError', downloadError);
    frame.addEventListener('downloadOk', downloadOk);
    meteo = new Meteo(frame);
    addCities();
    configureButtons();
    setCity(localStorage.getItem('default_city'));
})
