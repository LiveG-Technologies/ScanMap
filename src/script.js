var scanner;
var camera = 0;
var map;
var mapFeatures = {};

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

function resetPosition() {
    var pos = mapFeatures["geo"].getPosition();

    map.getView().setCenter(pos);
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
                zoom: 15
            }),

            interactions: ol.interaction.defaults({
                altShiftDragRotate: false,
                pinchRotate: false
            }),

            controls: ol.control.defaults({
                zoom: false,
                attribution: false,
                rotate: false
            })
        });

        mapFeatures["geo"] = new ol.Geolocation ({
            projection: map.getView().getProjection(),
            tracking: true,
            trackingOptions: {
                enableHighAccuracy: true,
                maximumAge: 2000
            }
        });

        mapFeatures["iconStyle"] = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 100],
                anchorXUnits: "fraction",
                anchorYUnits: "pixels",
                scale: 0.2,
                opacity: 1,
                src: "../art/location.png"
            })
        });

        mapFeatures["iconFeature"] = new ol.Feature();

        mapFeatures["iconSource"] = new ol.source.Vector({
            features: [mapFeatures["iconFeature"]]
        });

        mapFeatures["iconLayer"] = new ol.layer.Vector({
            source: mapFeatures["iconSource"],
            style: mapFeatures["iconStyle"]
        });

        map.addLayer(mapFeatures["iconLayer"]);

        var first = true;

        mapFeatures["geo"].on("change", function() {
            var pos = mapFeatures["geo"].getPosition();

            mapFeatures["iconFeature"].setGeometry(new ol.geom.Point(pos));

            if (map.getView().getCenter() == pos || first) {
                map.getView().setCenter(pos);

                first = false;
            }
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