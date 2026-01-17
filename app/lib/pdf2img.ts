export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

function asReadableError(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  try {
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object') {
      const o = e as Record<string, unknown>;
      const parts: string[] = [];
      if (typeof o.name === 'string') parts.push(String(o.name));
      if (typeof o.message === 'string') parts.push(String(o.message));
      if (typeof o.reason === 'string') parts.push(String(o.reason));
      if (typeof o.code === 'string' || typeof o.code === 'number') parts.push(`code=${o.code}`);
      if (parts.length) return parts.join(': ');
      return JSON.stringify(o);
    }
    return String(e);
  } catch {
    return String(e);
  }
}

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // Dynamically load pdf.js and its worker in a Vite-friendly way
  loadPromise = (async () => {
    try {
      const lib = await import("pdfjs-dist");
      // In Vite, import the worker as a separate bundle
      // @ts-ignore - ?worker is a Vite query and not typed
      const PdfWorker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?worker")).default;
      // Use workerPort instead of workerSrc for ESM builds
      // https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#can-i-bundle-pdfjs
      lib.GlobalWorkerOptions.workerPort = new PdfWorker();
      pdfjsLib = lib;
      return lib;
    } catch (e) {
      console.error('pdf.js workerPort init failed, falling back to workerSrc. Error:', e);
      // Fallback: try legacy ESM path with public worker URL if worker construction fails
      try {
        // @ts-ignore - direct ESM build import
        const lib = await import("pdfjs-dist/build/pdf.mjs");
        // @ts-ignore
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
      } catch (err) {
        console.error('pdf.js fallback load failed:', err);
        throw new Error(`Failed to load pdf.js: ${asReadableError(err)}`);
      }
    }
  })();

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 3 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Canvas 2D context not available",
      };
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 1.0)
    );

    if (!blob) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to create image blob from canvas",
      };
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${originalName}.png`, {
      type: "image/png",
    });

    return {
      imageUrl: URL.createObjectURL(blob),
      file: imageFile,
    };
  } catch (err) {
    const readable = asReadableError(err);
    console.error('convertPdfToImage failed:', err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${readable}`,
    };
  }
}