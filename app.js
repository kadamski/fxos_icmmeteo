var app = (function(Meteo, _) {
    'use strict';

    var VERSION='0.1.1';
    var meteo;
    var frame;

    var createFrame = function () {
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
    };

    var retry = function () {
        meteo.update();
    };

    var addCities = function () {
        var _helper = function(ul, c) {
            var i, c, len, html="", localized;
            for(i=0, len=c.length; i<len; i++) {
                localized=_(c[i]) || c[i];
                html+='<li><a href="#" data-city="{0}">{1}</a></li>'.format(c[i], localized);
            }
            ul.innerHTML+=html;
        }

        _helper(document.getElementById('citiesUl'), meteo.getCities(false));
        _helper(document.getElementById('capitalsUl'), meteo.getCities(true));

        document.getElementById('cities').addEventListener('click', function (e) {
            var c=e.target.getAttribute('data-city');
            if(c) {
                setCity(c);
            }
        });
    };

    var handleVisibilityChange = function () {
        if(document.hidden) {
            return;
        }
        meteo.showImage(false);
    };

    var configureButtons = function () {
        var _setDefaultCity = function() {
            var curCity;
            if(isCityBookmarked()) {
                return;
            }

            curCity=meteo.currentCity();
            if(curCity==null) {
                alert(_('choose_city_warning'));
            } else if(confirm(_('set_default', {'city': curCity}))) {
                localStorage.setItem('default_city', curCity);
                setBookmarkIcon();
            }
        };
        var _toggleModel = function() {
            var modelName=document.getElementById('modelName');
            var curModel=meteo.toggleModel(); 

            modelName.innerHTML=curModel.slice(0,2).toUpperCase();
        };
        var _about = function() {
            alert(_('about')+' '+VERSION);
        };

        var setDefaultBtn = document.getElementById('startingCityBtn');
        setDefaultBtn.addEventListener('click', _setDefaultCity);
        var toggleBtn = document.getElementById('toggleBtn');
        toggleBtn.addEventListener('click', _toggleModel);
        var aboutBtn = document.getElementById('aboutBtn');
        aboutBtn.addEventListener('click', _about);
        var retryBtn = document.getElementById('retryBtn');
        retryBtn.addEventListener('click', retry);
    };

    var badCity = function () {
        document.getElementById('noCityMsg').style.display='block';
        document.getElementById('buttons').style.display='none';
    };

    var isCityBookmarked = function () {
        var curCity=meteo.currentCity();
        return (curCity && curCity===localStorage.getItem('default_city'));
    };

    var setBookmarkIcon = function () {
        var bookmarkIcon=document.getElementById('bookmarkIcon');
        var c;
        if(isCityBookmarked()) {
            c="icon action-icon bookmarked";
        } else {
            c="icon action-icon bookmark";
        }
        bookmarkIcon.setAttribute("class", c);
    };

    var setCity = function (city) {
        if(!meteo.setCity(city)) {
            badCity();
            return;
        }
        document.getElementById('mainTitle').innerHTML=city;
        document.getElementById('noCityMsg').style.display='none';
        document.getElementById('buttons').style.display='block';
        setBookmarkIcon();
    };

    var downloadOk = function () {
        document.getElementById('errorMsg').style.display='none';
        frame.style.display='block';
    };

    var downloadError = function () {
        var div=document.getElementById('errorMsg');
        div.style.display='block';
        frame.style.display='none';
    };

    var init = function () {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        frame=createFrame();
        frame.addEventListener('downloadError', downloadError);
        frame.addEventListener('downloadOk', downloadOk);
        meteo = new Meteo(frame);
        addCities();
        configureButtons();
        setCity(localStorage.getItem('default_city'));
    };

    return {
        'init': init,
        'a': addCities
    };
})(Meteo, document.webL10n.get);

document.addEventListener('localized', function () {
    app.init();
});
