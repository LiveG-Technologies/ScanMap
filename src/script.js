var scanner;

$(function() {
    scanner = new Instascan.Scanner({video: $("#preview")[0]});

    scanner.addListener("scan", function(content) {
        alert(content);
    });

    Instascan.Camera.getCameras().then(function(cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            alert("No cameras found.");
        }
    });
});