function main() {
    var xmlhttp=new XMLHttpRequest({mozSystem: true});
    xmlhttp.open("GET",'http://www.meteo.pl/meteorogram_um_js.php',true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
            var date=/UM_FULLDATE="([0-9]{10})"/.exec(xmlhttp.response)[1];
            var img=document.getElementById('img');
            var row=436;
            var col=181;
            img.src='http://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u&fdate='+date+'&row='+row+'&col='+col+'&lang=pl';
            var a = new MozActivity({ name: "view", data: { type: "url", url: img.src }});
            a.onerror = function() { alert("Can't view the image!"); };
        }
    };
    xmlhttp.onerror = function () { alert("Can't download"); };
    xmlhttp.send();
}

document.addEventListener("DOMContentLoaded", function () {
    main();
})
