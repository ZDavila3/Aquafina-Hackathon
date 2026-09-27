import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./Scan.css";

/* =========================================================
   AQUA IMPACT RULES
   AI identifies the item.
   These rules provide the educational information.
========================================================= */

function getEnvironmentalImpact(result) {
    const material = (result.material || "").toLowerCase();
    const category = (result.category || "").toLowerCase();
    const item = (result.item || "").toLowerCase();

    // PLASTIC
    if (
        material.includes("plastic") ||
        material.includes("polyethylene") ||
        material.includes("pet") ||
        material.includes("hdpe") ||
        material.includes("ldpe") ||
        material.includes("film") ||
        item.includes("plastic")
    ) {
        return {
            disposal:
                category === "recyclable"
                    ? "Recyclable — check your local recycling rules before placing it in the bin."
                    : "Trash — many flexible or multilayer plastic items are not accepted in curbside recycling. Check local guidance.",

            animal: "Mariana Snailfish",
            animalIcon: "🐟",

            animalReason:
                "Plastic pollution and other human-produced contaminants can reach extreme ocean depths, including the Mariana Trench.",

            impact:
                "If plastic is improperly discarded, it can enter waterways and eventually contribute to marine pollution that reaches deep-ocean ecosystems.",

            action:
                "Keep plastic waste out of streets, drains, rivers, and waterways. Follow your local disposal or recycling rules."
        };
    }

    // PAPER / CARDBOARD
    if (
        material.includes("paper") ||
        material.includes("cardboard") ||
        material.includes("paperboard") ||
        item.includes("cardboard") ||
        item.includes("paper")
    ) {
        return {
            disposal:
                "Recyclable — keep paper and cardboard clean and dry, then follow your local recycling rules.",

            animal: "Hadal Amphipod",
            animalIcon: "🦐",

            animalReason:
                "Hadal amphipods live in the deepest parts of the ocean and depend on organic material that reaches the seafloor.",

            impact:
                "Waste that escapes into waterways can contribute to pollution and alter the material that eventually reaches deep-ocean ecosystems.",

            action:
                "Recycle clean paper and cardboard when accepted locally, and keep loose waste away from waterways."
        };
    }

    // ALUMINUM / METAL
    if (
        material.includes("aluminum") ||
        material.includes("aluminium") ||
        material.includes("metal") ||
        material.includes("steel") ||
        item.includes("aluminum") ||
        item.includes("aluminium")
    ) {
        return {
            disposal:
                "Recyclable — empty and rinse the container, then follow your local recycling rules.",

            animal: "Dumbo Octopus",
            animalIcon: "🐙",

            animalReason:
                "Dumbo octopuses live in deep water and can be affected by pollution and changes to their deep-sea habitat.",

            impact:
                "Improperly discarded waste can eventually enter aquatic environments and contribute to marine pollution.",

            action:
                "Recycle metal containers when your local program accepts them, and never intentionally discard them into waterways."
        };
    }

    // GLASS
    if (
        material.includes("glass") ||
        item.includes("glass")
    ) {
        return {
            disposal:
                "Recyclable in many programs — check your local recycling rules because accepted glass types vary.",

            animal: "Sea Pig",
            animalIcon: "🐖",

            animalReason:
                "Sea pigs live directly on deep-sea sediments, where pollution and disturbance of the seafloor can affect their habitat.",

            impact:
                "Waste that reaches aquatic environments can eventually contribute to pollution of marine habitats.",

            action:
                "Use your local glass recycling program when available and keep broken glass out of waterways."
        };
    }

    // ORGANIC / COMPOST
    if (
        category.includes("compost") ||
        material.includes("organic") ||
        item.includes("food") ||
        item.includes("fruit") ||
        item.includes("vegetable")
    ) {
        return {
            disposal:
                "Compostable — use an appropriate composting program when available.",

            animal: "Hadal Amphipod",
            animalIcon: "🦐",

            animalReason:
                "Hadal amphipods are scavengers that consume organic material reaching the deepest parts of the ocean.",

            impact:
                "Keeping food waste in the correct waste stream helps reduce unnecessary waste from entering waterways.",

            action:
                "Compost food waste when possible and keep it out of storm drains and natural waterways."
        };
    }

    // DEFAULT
    return {
        disposal:
            "Check your local disposal guidelines because the correct waste stream depends on the material and your community's rules.",

        animal: "Mariana Snailfish",
        animalIcon: "🐟",

        animalReason:
            "Plastic pollution and other human-produced contaminants can reach extreme ocean depths.",

        impact:
            "Improperly discarded waste can enter waterways and contribute to pollution that affects marine ecosystems.",

        action:
            "When in doubt, keep waste out of waterways and check your local disposal guidance."
    };
}


/* =========================================================
   SCAN PAGE
========================================================= */

export function Scan() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const barcodeControlsRef = useRef(null);

    const [mode, setMode] = useState("camera");
    const [cameraOn, setCameraOn] = useState(false);
    const [status, setStatus] = useState("Ready to scan");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);


    /* =====================================================
       CAMERA
    ===================================================== */

    async function startCamera() {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setStatus("Camera is not supported by this browser.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraOn(true);

            if (mode === "barcode") {
                setStatus("Point your camera at a barcode");
                startBarcodeScanner();
            } else {
                setStatus("Point your camera at trash");
            }

        } catch (error) {
            console.error("Camera error:", error);

            setStatus(
                "Camera access was blocked. Please allow camera permissions."
            );
        }
    }


    function stopCamera() {
        if (barcodeControlsRef.current) {
            barcodeControlsRef.current.stop();
            barcodeControlsRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOn(false);
        setStatus("Camera stopped");
    }


    /* =====================================================
       CAPTURE IMAGE
    ===================================================== */

    function captureImage() {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            setStatus("Camera is not ready.");
            return;
        }

        if (!video.videoWidth || !video.videoHeight) {
            setStatus("Camera image is not ready yet.");
            return;
        }

        setLoading(true);
        setStatus("Analyzing image...");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            setLoading(false);
            setStatus("Could not capture camera image.");
            return;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            async (blob) => {
                if (!blob) {
                    setLoading(false);
                    setStatus("Could not capture image.");
                    return;
                }

                try {
                    const formData = new FormData();

                    formData.append(
                        "image",
                        blob,
                        "scan.jpg"
                    );

                    console.log(
                        "Sending image to Aqua AI backend..."
                    );

                    const response = await fetch(
                        "/api/scan",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Backend request failed: ${response.status}`
                        );
                    }

                    const data = await response.json();

                    console.log(
                        "Aqua AI response:",
                        data
                    );

                    setResult(data);
                    setStatus("Scan complete!");

                } catch (error) {
                    console.error(
                        "Scan error:",
                        error
                    );

                    setStatus(
                        "Something went wrong while analyzing the image."
                    );

                    setResult(null);

                } finally {
                    setLoading(false);
                }
            },
            "image/jpeg",
            0.9
        );
    }


    /* =====================================================
       BARCODE SCANNER
    ===================================================== */

    async function startBarcodeScanner() {
        try {
            if (!videoRef.current) {
                return;
            }

            const reader =
                new BrowserMultiFormatReader();

            const controls =
                await reader.decodeFromVideoElement(
                    videoRef.current,
                    (barcodeResult) => {
                        if (barcodeResult) {
                            const barcode =
                                barcodeResult.getText();

                            console.log(
                                "Barcode:",
                                barcode
                            );

                            setStatus(
                                `Barcode detected: ${barcode}`
                            );

                            setResult({
                                item: "Product barcode detected",
                                material: "Looking up product...",
                                barcode
                            });

                            controls.stop();

                            barcodeControlsRef.current =
                                null;
                        }
                    }
                );

            barcodeControlsRef.current =
                controls;

        } catch (error) {
            console.error(
                "Barcode scanner error:",
                error
            );

            setStatus(
                "Unable to start barcode scanner."
            );
        }
    }


    /* =====================================================
       CHANGE MODE
    ===================================================== */

    function changeMode(newMode) {
        stopCamera();

        setMode(newMode);
        setResult(null);
        setLoading(false);

        if (newMode === "barcode") {
            setStatus("Barcode mode selected");
        } else {
            setStatus("Trash mode selected");
        }
    }


    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {
        return () => {
            if (barcodeControlsRef.current) {
                barcodeControlsRef.current.stop();
            }

            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);


    /* =====================================================
       IMPACT DATA
    ===================================================== */

    const environmentalImpact = result
        ? getEnvironmentalImpact(result)
        : null;


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <main className="aqua-scan-page">

            {/* HEADER */}

            <section className="aqua-header">

                <div className="aqua-logo">
                    🌊
                </div>

                <p className="aqua-label">
                    AQUA AI
                </p>

                <h1>
                    Smart Waste Scanner
                </h1>

                <p className="aqua-subtitle">
                    Identify waste, understand its impact, and learn how
                    to dispose of it responsibly.
                </p>

            </section>


            {/* SCAN MODES */}

            <div className="scan-modes">

                <button
                    className={
                        mode === "camera"
                            ? "mode-button active"
                            : "mode-button"
                    }
                    onClick={() =>
                        changeMode("camera")
                    }
                >
                    📷

                    <span>
                        <strong>
                            Scan Trash
                        </strong>

                        <small>
                            AI identification
                        </small>
                    </span>

                </button>


                <button
                    className={
                        mode === "barcode"
                            ? "mode-button active"
                            : "mode-button"
                    }
                    onClick={() =>
                        changeMode("barcode")
                    }
                >
                    🏷️

                    <span>
                        <strong>
                            Scan Barcode
                        </strong>

                        <small>
                            Identify products
                        </small>
                    </span>

                </button>

            </div>


            {/* CAMERA */}

            <section className="camera-card">

                <div className="camera-window">

                    <video
                        ref={videoRef}
                        className="camera-video"
                        autoPlay
                        playsInline
                        muted
                    />


                    {!cameraOn && (
                        <div className="camera-placeholder">

                            <div className="camera-icon">
                                📷
                            </div>

                            <h2>
                                {mode === "barcode"
                                    ? "Scan a barcode"
                                    : "Scan your trash"}
                            </h2>

                            <p>
                                {mode === "barcode"
                                    ? "Point your camera at a product barcode."
                                    : "Place the item inside the camera frame."}
                            </p>

                        </div>
                    )}


                    {cameraOn && (
                        <div className="scanner-frame">

                            <div className="corner top-left"></div>
                            <div className="corner top-right"></div>
                            <div className="corner bottom-left"></div>
                            <div className="corner bottom-right"></div>

                            <div className="scan-line"></div>

                        </div>
                    )}

                </div>


                {/* STATUS */}

                <div className="camera-status">

                    <span className="status-dot"></span>

                    {status}

                </div>


                {/* CONTROLS */}

                <div className="camera-controls">

                    {!cameraOn ? (

                        <button
                            className="primary-button"
                            onClick={startCamera}
                        >
                            📷 Open Camera
                        </button>

                    ) : (

                        <>

                            {mode === "camera" && (
                                <button
                                    className="primary-button"
                                    onClick={captureImage}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "🤖 Analyzing..."
                                        : "🔍 Capture & Scan"}
                                </button>
                            )}

                            <button
                                className="secondary-button"
                                onClick={stopCamera}
                                disabled={loading}
                            >
                                Stop Camera
                            </button>

                        </>

                    )}

                </div>

            </section>


            {/* HIDDEN CANVAS */}

            <canvas
                ref={canvasRef}
                style={{ display: "none" }}
            />


            {/* =================================================
                RESULTS
            ================================================= */}

            {result && (

                <section className="result-card">

                    {/* RESULT HEADER */}

                    <div className="result-title">

                        <span>
                            ✨
                        </span>

                        <div>

                            <p>
                                AQUA AI RESULT
                            </p>

                            <h2>
                                {result.item}
                            </h2>

                        </div>

                    </div>


                    {/* BARCODE */}

                    {result.barcode && (
                        <div className="result-row">

                            <span>
                                Barcode
                            </span>

                            <strong>
                                {result.barcode}
                            </strong>

                        </div>
                    )}


                    {/* MATERIAL */}

                    {result.material && (
                        <div className="result-row">

                            <span>
                                Material
                            </span>

                            <strong>
                                {result.material}
                            </strong>

                        </div>
                    )}


                    {/* CATEGORY */}

                    {result.category && (
                        <div className="result-row">

                            <span>
                                Category
                            </span>

                            <strong>
                                {result.category}
                            </strong>

                        </div>
                    )}


                    {/* CONFIDENCE */}

                    {result.confidence !== null &&
                        result.confidence !== undefined && (

                            <div className="result-row">

                                <span>
                                    Confidence
                                </span>

                                <strong>
                                    {Math.round(
                                        result.confidence * 100
                                    )}%
                                </strong>

                            </div>
                        )}


                    <div className="result-divider"></div>


                    {/* =================================================
                        AQUA IMPACT
                    ================================================= */}

                    {environmentalImpact && (

                        <div className="aqua-impact">

                            {/* HEADER */}

                            <div className="impact-header">

                                <div className="impact-header-icon">
                                    🌊
                                </div>

                                <div>

                                    <p className="impact-label">
                                        AQUA IMPACT
                                    </p>

                                    <h3>
                                        What happens next?
                                    </h3>

                                    <p className="impact-subtitle">
                                        See how this item connects to our ocean ecosystem.
                                    </p>

                                </div>

                            </div>


                            {/* TWO CARDS */}

                            <div className="impact-grid">

                                {/* DISPOSAL */}

                                <div className="impact-card">

                                    <div className="impact-card-icon">
                                        ♻️
                                    </div>

                                    <div className="impact-card-content">

                                        <p className="impact-card-label">
                                            DISPOSAL
                                        </p>

                                        <h4>
                                            {result.category === "recyclable"
                                                ? "Recyclable"
                                                : result.category === "compostable"
                                                    ? "Compostable"
                                                    : result.category === "trash"
                                                        ? "Trash"
                                                        : "Check Local Guidelines"}
                                        </h4>

                                        <p>
                                            {environmentalImpact.disposal}
                                        </p>

                                    </div>

                                </div>


                                {/* ANIMAL */}

                                <div className="impact-card">

                                    <div className="impact-card-icon">
                                        {environmentalImpact.animalIcon}
                                    </div>

                                    <div className="impact-card-content">

                                        <p className="impact-card-label">
                                            DEEP-SEA ANIMAL IMPACT
                                        </p>

                                        <h4>
                                            {environmentalImpact.animal}
                                        </h4>

                                        <p>
                                            {environmentalImpact.animalReason}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* WHY IT MATTERS */}

                            <div className="impact-wide-card">

                                <div className="wide-card-icon">
                                    🌎
                                </div>

                                <div>

                                    <p className="impact-card-label">
                                        WHY IT MATTERS
                                    </p>

                                    <p className="wide-card-text">
                                        {environmentalImpact.impact}
                                    </p>

                                </div>

                            </div>


                            {/* BEST PRACTICE */}

                            <div className="impact-best-practice">

                                <div className="best-practice-icon">
                                    💡
                                </div>

                                <div>

                                    <p className="impact-card-label">
                                        AQUA BEST PRACTICE
                                    </p>

                                    <p className="best-practice-text">
                                        {environmentalImpact.action}
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                </section>
            )}


            {/* EDUCATIONAL SECTION */}

            <section className="aqua-info">

                <div className="info-card">

                    <span>
                        🌊
                    </span>

                    <div>

                        <h3>
                            Protect Our Waterways
                        </h3>

                        <p>
                            Everyday waste can make its way into rivers,
                            lakes, and oceans. Aqua AI helps you understand
                            what you're throwing away.
                        </p>

                    </div>

                </div>


                <div className="info-card">

                    <span>
                        ♻️
                    </span>

                    <div>

                        <h3>
                            Dispose Responsibly
                        </h3>

                        <p>
                            Learn whether an item belongs in recycling,
                            compost, trash, or another disposal stream.
                        </p>

                    </div>

                </div>

            </section>

        </main>
    );
}