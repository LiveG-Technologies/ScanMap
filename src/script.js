var scanner;
var camera = 0;

function changeCamera() {
    Instascan.Camera.getCameras().then(function(cameras) {
        camera++;
        
        if (camera >= cameras.length) {camera = 0;}

        if (!!window.chrome && window.orientation !== undefined && cameras.length == 2 && camera == 1) {
            $("#preview").css("transform", "rotateY(180deg)");
        } else {
            $("#preview").css("transform", "rotateY(0deg)");
        }

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
            scanner.start(cameras[0]);
        } else {
            alert("No cameras found.");
        }
    });
});