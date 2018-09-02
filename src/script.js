var scanner;
var scanning = true;
var camera = 0;
var map;
var mapFeatures = {};

function getScrollbarWidth() {
    var outer = document.createElement("div");

    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar";

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;

    outer.style.overflow = "scroll";

    var inner = document.createElement("div");

    inner.style.width = "100%";
    outer.appendChild(inner);        

    var widthWithScroll = inner.offsetWidth;

    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

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

    map.getView().animate({center: pos});
}

function openWebpage(URL) {
    $("#webpageContent").attr("src", URL);
    $("#webpageURL").text(URL);

    $("#webpage").fadeIn();
}

function closeWebpage() {
    scanning = true;

    $("#webpage").fadeOut();

    setTimeout(function() {
        $("#webpageContent").attr("src", "about:blank");
        $("#webpageURL").text("Webpage");
    }, 500);
}

$(function() {
    scanner = new Instascan.Scanner({video: $("#preview")[0]});

    scanner.addListener("scan", function(content) {
        if (scanning && $("body").scrollTop() <= 200) {
            scanning = false;

            $("#lens").css("background-color", "rgba(95, 237, 83, 0.4)");

            setTimeout(function() {
                $("#lens").css("background-color", "rgba(255, 255, 255, 0.4)");

                setTimeout(function() {
                    openWebpage(content.replace("http://", "https://"));
                }, 500);
            }, 500);
        }
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
            alert("No cameras found, so you won't be able to scan anything. Sorry!");
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
                map.getView().animate({center: pos});

                first = false;
            }
        });
    }, 100);

    $("body").scroll(function() {
        if ($("body").scrollTop() > 200 - $("#options").height()) {
            $("#options").css({
                "position": "fixed",
                "top": "unset",
                "bottom": "0"
            });
        } else {
            $("#options").css({
                "position": "absolute",
                "top": "calc(100vh + 100px)",
                "bottom": "unset"
            });
        }
    });
});

setInterval(function() {
    if (navigator.onLine) {
        $(".online").css("display", "unset");
        $(".offline").css("display", "none");
    } else {
        $(".offline").css("display", "unset");
        $(".online").css("display", "none");
    }

    $("#preview").css("width", "calc(100vw - " + getScrollbarWidth() + "px)");
}, 0);