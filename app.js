
function main() {
    var xmlhttp=new XMLHttpRequest({mozSystem: true});
    xmlhttp.open("GET",'http://www.meteo.pl/meteorogram_um_js.php',true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
            var date=/UM_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
            var row=436;
            var col=181;
            var iframe=document.createElement("IFRAME"); 
            iframe.style.border='none';
            function _orientChange() {
                iframe.style.width=window.screen.width+'px';
                iframe.style.height=window.screen.height+'px';
            };
            screen.addEventListener("mozorientationchange", _orientChange);
            _orientChange();
            iframe.src='http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate='+date+'&row='+row+'&col='+col+'&lang=pl';
            document.body.appendChild(iframe);
        }
    };
    xmlhttp.onerror = function () { alert("Can't download"); };
    xmlhttp.send();
}

document.addEventListener("DOMContentLoaded", function () {
    main();
})
