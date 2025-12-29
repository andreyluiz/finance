import { Html5Qrcode } from "html5-qrcode";

export async function scanQrFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamic import to avoid SSR issues with DOMMatrix/Canvas
    const pdfjs = await import("pdfjs-dist");

    // Set worker source
    if (typeof window !== "undefined") {
        // Use a CDN for the worker to avoid build configuration issues
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }


    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Determine scan order: Page 1, then Page N, then the rest
    const pagesToScan = new Set<number>();
    pagesToScan.add(1); // 1-based index
    if (numPages > 1) {
        pagesToScan.add(numPages);
    }
    // Add remaining pages if necessary (optional: purely scan 1 and last for now to save perf)
    // If we want to accept middle pages, we can add them:
    for (let i = 2; i < numPages; i++) {
        pagesToScan.add(i);
    }

    // Helper to scan a single page
    const scanPage = async (pageNumber: number): Promise<string | null> => {
        try {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better QR resolution

            // Create a canvas to render the page
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) return null;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page to canvas
            await page.render({
                canvasContext: context,
                viewport: viewport,
            } as any).promise;

            // Convert canvas to Blob for scanning
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
            );

            if (!blob) return null;

            // Create a File from Blob to satisfy Html5Qrcode interface
            const imageFile = new File([blob], `page-${pageNumber}.png`, { type: "image/png" });

            // Setup temporary scanner
            // We need a DOM element for Html5Qrcode, even if it's hidden?
            // scanFileV2 works without a specific element binding if we use the static analyzer?
            // Actually Html5Qrcode needs an element ID constructor.

            const tempId = `pdf-qr-scanner-${Math.random().toString(36).substring(7)}`;
            const tempDiv = document.createElement("div");
            tempDiv.id = tempId;
            tempDiv.style.display = "none";
            document.body.appendChild(tempDiv);

            const scanner = new Html5Qrcode(tempId);

            try {
                const result = await scanner.scanFileV2(imageFile, false);
                return result.decodedText;
            } catch (err) {
                // QR not found on this page
                return null;
            } finally {
                // Cleanup
                scanner.clear();
                document.body.removeChild(tempDiv);
            }
        } catch (err) {
            console.warn(`Failed to scan page ${pageNumber}:`, err);
            return null;
        }
    };

    // Iterate through pages
    let foundInvalidQr: string | null = null;

    console.log(`[PDF Scanner] Starting scan of ${pagesToScan.size} pages...`);

    for (const pageNum of pagesToScan) {
        console.log(`[PDF Scanner] Scanning page ${pageNum}...`);
        const result = await scanPage(pageNum);
        if (result) {
            console.log(`[PDF Scanner] Page ${pageNum} result:`, result.substring(0, 50) + "...");

            // Check if it looks like a Swiss QR Bill (starts with SPC)
            if (result.trim().startsWith("SPC")) {
                console.log(`[PDF Scanner] Valid Swiss QR found on page ${pageNum}`);
                return result;
            }
            // Store the invalid result to return if no valid one is found
            if (!foundInvalidQr) {
                console.warn(`[PDF Scanner] Invalid Swiss QR on page ${pageNum}, continuing search...`);
                foundInvalidQr = result;
            }
        } else {
            console.log(`[PDF Scanner] No QR found on page ${pageNum}`);
        }
    }

    if (foundInvalidQr) {
        console.warn("[PDF Scanner] Only invalid QR codes found, returning the first one.");
        return foundInvalidQr;
    }

    console.error("[PDF Scanner] No QR code found in any page.");
    throw new Error("No valid QR code found in the PDF.");
}
