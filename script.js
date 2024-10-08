require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/GroupLayer",
    "esri/geometry/Circle",
    "esri/geometry/Point",
], function (
    Map,
    MapView,
    TileLayer,
    Graphic,
    GraphicsLayer,
    GroupLayer,
    Circle,
    Point
) {
    const worldImagery = new TileLayer({
        portalItem: {
            id: "a66bfb7dd3b14228bf7ba42b138fe2ea",
        },
    });

    worldImagery.when(() => {
        worldImagery.sublayers.forEach((layer) => {
            layer.popupEnabled = false; // Disable popups for sublayers
        });
    });

    const tileLayer = new TileLayer({
        portalItem: {
            id: "10df2279f9684e4a9f6a7f08febac2a9", // world imagery
        },
    });

    tileLayer.when(() => {
        tileLayer.sublayers.forEach((layer) => {
            layer.popupEnabled = false; // Disable popups for sublayers
        });
    });

    const graphicsLayer = new GraphicsLayer({
        blendMode: "destination-in", // Show only what overlaps with the circles
    });

    const groupLayer = new GroupLayer({
        layers: [tileLayer, graphicsLayer],
        opacity: 1, // Start fully visible
    });

    const map = new Map({
        layers: [worldImagery, groupLayer],
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 4,
        center: [-95.712891, 37.09024],
        constraints: {
            snapToZoom: false,
            minScale: 147914381,
        },
    });

    let mainCircleGraphic = null; // Main spyglass inner circle
    let outerCircleGraphic = null; // Outer spyglass border circle
    let spyglassRadius = 100000; // Initial radius in meters

    function createMainCircle(mapPoint) {
        const mainCircle = new Circle({
            center: mapPoint,
            radius: spyglassRadius, // Use the current radius
        });

        const mainSymbol = {
            type: "simple-fill",
            color: "rgba(255, 255, 255, 1)", // Original transparent white for the fill
            outline: null, // No outline for the inner circle
        };

        return new Graphic({
            geometry: mainCircle,
            symbol: mainSymbol,
        });
    }

    function createOuterCircle(mapPoint) {
        const outerCircleRadius = spyglassRadius * 1.05; // 5% larger than the inner circle
        const outerCircle = new Circle({
        center: mapPoint,
        radius: outerCircleRadius, // Use the updated radius
    });

        const outerSymbol = {
            type: "simple-fill",
            color: [0, 0, 0, 0], // Fully transparent fill for the outer circle
            outline: {
                color: [255, 255, 255, 0.7], // Semi-transparent white outline
                width: 10, // Thick outline to mimic the spyglass border
            },
        };

        return new Graphic({
            geometry: outerCircle,
            symbol: outerSymbol,
        });
    }

    // Mouse move event to make the circles follow the mouse
    view.on("pointer-move", function (event) {
        const mapPoint = view.toMap(event);

        if (mapPoint) {
            if (mainCircleGraphic) {
                graphicsLayer.remove(mainCircleGraphic);
            }
            if (outerCircleGraphic) {
                graphicsLayer.remove(outerCircleGraphic);
            }

            mainCircleGraphic = createMainCircle(mapPoint);
            outerCircleGraphic = createOuterCircle(mapPoint);

            graphicsLayer.add(mainCircleGraphic);
            graphicsLayer.add(outerCircleGraphic);

            worldImagery.effect = "blur(8px) brightness(1.2) grayscale(0.8)";
            groupLayer.effect = "brightness(1.5) drop-shadow(0px 0px 12px white)";
        }
    });

    // Reset the effects when the mouse leaves the map
    view.on("pointer-leave", function () {
        if (mainCircleGraphic) {
            graphicsLayer.remove(mainCircleGraphic);
            mainCircleGraphic = null;
        }
        if (outerCircleGraphic) {
            graphicsLayer.remove(outerCircleGraphic);
            outerCircleGraphic = null;
        }

        worldImagery.effect = null;
        groupLayer.effect = null;
    });

    // Mouse click event to zoom to the extent of the spyglass
    view.on("click", function (event) {
        const mapPoint = view.toMap(event);
        const mainCircle = createMainCircle(mapPoint);
        const zoomExtent = mainCircle.geometry.extent;

        // Zoom to the new extent
        view.goTo({
            target: zoomExtent,
            zoom: view.zoom + 4, // Adjust zoom level as needed
        });
    });

    // Inside your existing script
    const icon = document.getElementById('icon');
    const messageDiv = document.getElementById('messageDiv');

    // Ensure icon and messageDiv exist before adding event listener
    if (icon && messageDiv) {
        icon.addEventListener('click', function () {
            if (messageDiv.style.display === 'none' || messageDiv.style.display === '') {
                messageDiv.style.display = 'block'; // Show the message
                icon.innerHTML = '-'; // Change to minus icon
            } else {
                messageDiv.style.display = 'none'; // Hide the message
                icon.innerHTML = '+'; // Change to plus icon
            }
        });
    }

    // Update the radius when the input value changes
    const radiusInput = document.getElementById('radius');
    const radiusValue = document.getElementById('radiusValue');

    radiusInput.addEventListener('input', function () {
        spyglassRadius = parseInt(this.value, 10); // Update the radius
        radiusValue.textContent = this.value; // Display the current radius

        // Update the circles to reflect the new radius
        if (mainCircleGraphic) {
            const currentPoint = mainCircleGraphic.geometry.centroid; // Get current position of main circle
            graphicsLayer.remove(mainCircleGraphic);
            mainCircleGraphic = createMainCircle(currentPoint);
            graphicsLayer.add(mainCircleGraphic);
        }
        if (outerCircleGraphic) {
            const currentPoint = outerCircleGraphic.geometry.centroid; // Get current position of outer circle
            graphicsLayer.remove(outerCircleGraphic);
            outerCircleGraphic = createOuterCircle(currentPoint);
            graphicsLayer.add(outerCircleGraphic);
        }
    });
});
