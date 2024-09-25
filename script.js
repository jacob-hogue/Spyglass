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
        const outerCircle = new Circle({
            center: mapPoint,
            radius: spyglassRadius + 5000, // Slightly larger radius for the outer effect
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

    // Update the radius when the input value changes
    const radiusInput = document.getElementById('radius');
    const radiusValue = document.getElementById('radiusValue');

    radiusInput.addEventListener('input', function () {
        spyglassRadius = parseInt(this.value, 10); // Update the radius
        radiusValue.textContent = this.value; // Display the current radius
    });
});
