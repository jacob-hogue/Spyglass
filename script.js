// script.js

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/GroupLayer",
    "esri/geometry/Circle",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (
    Map,
    MapView,
    TileLayer,
    Graphic,
    GraphicsLayer,
    GroupLayer,
    Circle,
    BasemapGallery,
    Expand
) {
    // Initialize your map and layers (the same as your original code)
    const worldImagery = new TileLayer({
        portalItem: {
            id: "a66bfb7dd3b14228bf7ba42b138fe2ea",
        },
    });

    const tileLayer = new TileLayer({
        portalItem: {
            id: "10df2279f9684e4a9f6a7f08febac2a9",
        },
    });

    const graphicsLayer = new GraphicsLayer({
        blendMode: "destination-in",
    });

    const groupLayer = new GroupLayer({
        layers: [tileLayer, graphicsLayer],
        opacity: 1,
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

    const basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div"),
    });

    const expand = new Expand({
        view: view,
        content: basemapGallery,
        expanded: false,
    });

    view.ui.add(expand, "top-right");

    let mainCircleGraphic = null;
    let outerCircleGraphic = null;

    function createMainCircle(mapPoint) {
        const mainCircle = new Circle({
            center: mapPoint,
            radius: 100000,
        });

        const mainSymbol = {
            type: "simple-fill",
            color: "rgba(255, 255, 255, 1)",
            outline: null,
        };

        return new Graphic({
            geometry: mainCircle,
            symbol: mainSymbol,
        });
    }

    function createOuterCircle(mapPoint) {
        const outerCircle = new Circle({
            center: mapPoint,
            radius: 105000,
        });

        const outerSymbol = {
            type: "simple-fill",
            color: [0, 0, 0, 0],
            outline: {
                color: [255, 255, 255, 0.7],
                width: 10,
            },
        };

        return new Graphic({
            geometry: outerCircle,
            symbol: outerSymbol,
        });
    }

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

    view.on("click", function (event) {
        const mapPoint = view.toMap(event);
        const mainCircle = createMainCircle(mapPoint);
        const zoomExtent = mainCircle.geometry.extent;

        view.goTo({
            target: zoomExtent,
            zoom: view.zoom + 1,
        });
    });
});
