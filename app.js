var UPDATE_INTERVAL=(1000*60*60);   // 1h

function createFrame() {
    var frame=document.getElementById('frame');
    if(!frame) {
        var frame=document.createElement("IFRAME");
        frame.setAttribute('id', 'frame');
        frame.setAttribute('lastDate', '0');
        frame.setAttribute('lastUpdate', '0');
        frame.style.border='none';
        function _orientChange() {
            frame.style.width=window.screen.width+'px';
            frame.style.height=window.screen.height+'px';
        };
        screen.addEventListener("mozorientationchange", _orientChange);
        _orientChange();
        document.body.appendChild(frame);
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

function handleVisibilityChange() {
    if(document.hidden) {
        return;
    }

    var frame=createFrame();

    var lastUpdate=frame.getAttribute('lastUpdate');
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
            var row=436;
            var col=181;
            loadImage(frame, date, row, col);
            frame.setAttribute('lastUpdate', time);
        }
    };
    xmlhttp.onerror = function () { alert("Can't download"); };
    xmlhttp.send();
}

function main() {
    handleVisibilityChange();
}

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    main();
})
