document.addEventListener("DOMContentLoaded", function () {
    let aoiCanvas = document.getElementById("aoiCanvas");
    if (!aoiCanvas) {
        console.error("Canvas element with id 'aoiCanvas' not found");
        return;
    }

    let ctx = aoiCanvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to get '2d' context from canvas");
        return;
    }

    let isDrawing = false;
    let startX = 0, startY = 0;
    let currentRect = {};
    let aois = [];

    // Disable text selection
    function disableTextSelection() {
        document.body.classList.add("disable-selection");
        document.addEventListener("selectstart", preventSelection);
        document.addEventListener("dragstart", preventSelection);
    }

    // Re-enable text selection
    function enableTextSelection() {
        document.body.classList.remove("disable-selection");
        document.removeEventListener("selectstart", preventSelection);
        document.removeEventListener("dragstart", preventSelection);
    }

    // Prevent default behavior for selection
    function preventSelection(e) {
        e.preventDefault();
    }

    // Enable AOI selection mode when called
    window.enableAOISelection = function () {
        aoiCanvas.style.pointerEvents = 'auto';
        isDrawing = false;  // Reset isDrawing flag
        disableTextSelection();  // Disable text selection
        console.log("AOI selection enabled.");
    };

    // Start drawing rectangle on mousedown
    aoiCanvas.addEventListener("mousedown", (e) => {
        if (aoiCanvas.style.pointerEvents === 'none') return; // Ignore if canvas is disabled

        isDrawing = true;
        const rect = aoiCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        currentRect = {}; // Reset current rectangle
    });

    // Draw rectangle dynamically on mousemove
    aoiCanvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;

        const rect = aoiCanvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        currentRect = {
            x: startX,
            y: startY,
            width: mouseX - startX,
            height: mouseY - startY
        };
        drawCanvas();
        drawRectangle(currentRect);
    });

    // Finalize AOI on mouseup
    aoiCanvas.addEventListener("mouseup", () => {
        if (!isDrawing) return;

        isDrawing = false;
        aois.push(currentRect);
        currentRect = {};
        console.log("AOI recorded:", aois);
        aoiCanvas.style.pointerEvents = 'none';  // Disable canvas interactions until re-enabled
        enableTextSelection(); // Re-enable text selection
    });

    // Draw the canvas and all AOIs
    function drawCanvas() {
        ctx.clearRect(0, 0, aoiCanvas.width, aoiCanvas.height);
        aois.forEach(aoi => drawRectangle(aoi));
    }

    // Draw a rectangle on the canvas
    function drawRectangle(rect) {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
    }

    // Clear AOIs
    window.clearAOIs = function () {
        aois = [];
        drawCanvas();
    };

    // Save AOIs as JSON
    window.saveAOIs = function () {
        if (aois.length === 0) {
            alert("No AOIs defined.");
            return;
        }
        const aoiData = JSON.stringify(aois);
        const blob = new Blob([aoiData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "aoi_config.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("AOIs saved as JSON.");
    };
});