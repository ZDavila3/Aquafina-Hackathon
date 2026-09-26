import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./Scan.css";

export function Scan() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const barcodeReaderRef = useRef(null);
    const barcodeControlsRef = useRef(null);

    const [mode, setMode] = useState("camera");
    const [cameraOn, setCameraOn] = useState(false);
    const [status, setStatus] = useState("Ready to scan");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // START CAMERA
    // ==========================================

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

    // ==========================================
    // STOP CAMERA
    // ==========================================

    function stopCamera() {
        // Stop barcode scanner
        if (barcodeControlsRef.current) {
            barcodeControlsRef.current.stop();
            barcodeControlsRef.current = null;
        }

        // Stop camera stream
        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        // Remove video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOn(false);
        setStatus("Camera stopped");
    }

    // ==========================================
    // CAPTURE IMAGE + SEND TO JAVA BACKEND
    // ==========================================

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

        // Set canvas to same size as camera frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            setLoading(false);
            setStatus("Could not capture camera image.");
            return;
        }

        // Copy current camera frame onto canvas
        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Convert canvas image into a JPEG blob
        canvas.toBlob(
            async (blob) => {
                if (!blob) {
                    setLoading(false);
                    setStatus("Could not capture image.");
                    return;
                }

                try {
                    // Create form data
                    const formData = new FormData();

                    // IMPORTANT:
                    // "image" must match @RequestParam("image")
                    // in our Java backend.
                    formData.append("image", blob, "scan.jpg");

                    console.log("Sending image to Aqua AI backend...");

                    // Send image to Spring Boot
                    const response = await fetch("/api/scan", {
                        method: "POST",
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error(
                            `Backend request failed: ${response.status}`
                        );
                    }

                    // Convert backend response into JavaScript object
                    const data = await response.json();

                    console.log("Aqua AI response:", data);

                    // Display result
                    setResult(data);

                    setStatus("Scan complete!");

                } catch (error) {
                    console.error("Scan error:", error);

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

    // ==========================================
    // BARCODE SCANNER
    // ==========================================

    async function startBarcodeScanner() {
        try {
            if (!videoRef.current) {
                return;
            }

            const reader = new BrowserMultiFormatReader();

            barcodeReaderRef.current = reader;

            const controls = await reader.decodeFromVideoElement(
                videoRef.current,
                (result, error) => {

                    if (result) {
                        const barcode = result.getText();

                        console.log("Barcode:", barcode);

                        setStatus(
                            `Barcode detected: ${barcode}`
                        );

                        setResult({
                            item: "Product barcode detected",
                            material: "Looking up product...",
                            barcode
                        });

                        controls.stop();
                        barcodeControlsRef.current = null;
                    }
                }
            );

            barcodeControlsRef.current = controls;

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

    // ==========================================
    // CHANGE SCANNING MODE
    // ==========================================

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

    // ==========================================
    // CLEANUP
    // ==========================================

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

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <main className="aqua-scan-page">

            {/* ================================
                HEADER
            ================================= */}

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


            {/* ================================
                SCAN MODE BUTTONS
            ================================= */}

            <div className="scan-modes">

                <button
                    className={
                        mode === "camera"
                            ? "mode-button active"
                            : "mode-button"
                    }
                    onClick={() => changeMode("camera")}
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
                    onClick={() => changeMode("barcode")}
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


            {/* ================================
                CAMERA
            ================================= */}

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


                {/* ================================
                    STATUS
                ================================= */}

                <div className="camera-status">

                    <span className="status-dot"></span>

                    {status}

                </div>


                {/* ================================
                    CAMERA CONTROLS
                ================================= */}

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


            {/* ================================
                HIDDEN CANVAS
            ================================= */}

            <canvas
                ref={canvasRef}
                style={{ display: "none" }}
            />


            {/* ================================
                RESULTS
            ================================= */}

            {result && (

                <section className="result-card">

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


                    {/* Barcode */}

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


                    {/* Material */}

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


                    {/* Category */}

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


                    {/* Confidence */}

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


                    <div className="coming-soon">

                        🤖 Real AI analysis will appear here

                    </div>

                </section>

            )}


            {/* ================================
                EDUCATIONAL SECTION
            ================================= */}

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