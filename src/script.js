var scanner;
var camera = 0;
var map;

function flipCamera(flip) {
    if (flip) {
        $("#preview").css("transform", "rotateY(180deg)");
    } else {
        $("#preview").css("transform", "rotateY(0deg)");
    }
}

function changeCamera() {
    Instascan.Camera.getCameras().then(function(cameras) {
        camera++;
        
        if (camera >= cameras.length) {camera = 0;}

        scanner.start(cameras[camera]);
    });
}

$(function() {
    scanner = new Instascan.Scanner({video: $("#preview")[0]});

    scanner.addListener("scan", function(content) {
        $("#lens").css("background-color", "rgba(95, 237, 83, 0.4)");

        setTimeout(function() {
            $("#lens").css("background-color", "rgba(255, 255, 255, 0.4)");

            setTimeout(function() {
                alert(content);
            }, 500);
        }, 500);
    });

    Instascan.Camera.getCameras().then(function(cameras) {
        if (cameras.length > 0) {
            if (cameras.length > 1) {
                scanner.start(cameras[1]);

                camera = 1;
            } else {
                scanner.start(cameras[0]);

                camera = 0;
            }
        } else {
            alert("No cameras found.");
        }
    });

    setTimeout(function() {
        map = new ol.Map({
            target: "map",

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],

            view: new ol.View({
                center: ol.proj.fromLonLat([-0.1, 51.5]),
                zoom: 10
            }),

            controls: ol.control.defaults({
                zoom: false,
                attribution: false,
                rotate: false
            })
        });
    }, 100);
});

setInterval(function() {
    if (navigator.onLine) {
        $(".online").css("display", "unset");
        $(".offline").css("display", "none");
    } else {
        $(".offline").css("display", "unset");
        $(".online").css("display", "none");
    }
}, 10);