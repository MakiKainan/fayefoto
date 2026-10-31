import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { PhotoStripRenderer } from './photoStripRenderer';
import { PhotoStripConfig } from '../types/photobooth';

export class ExportUtils {
  /**
   * Fires a vibrant celebratory confetti burst on the screen.
   */
  public static triggerConfetti(): void {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E5191C', '#FDFDFD', '#0F0F0F', '#FFEA00', '#99000A'],
    });
  }

  /**
   * Renders the strip at high DPI (e.g., 2.5x or 3x) and triggers file download.
   */
  public static async downloadImage(
    photos: string[],
    config: PhotoStripConfig,
    format: 'png' | 'jpeg' = 'png',
    dpiScale: number = 2.5
  ): Promise<void> {
    const offscreenCanvas = document.createElement('canvas');
    await PhotoStripRenderer.renderToCanvas(offscreenCanvas, {
      photos,
      config,
      exportScale: dpiScale,
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : 1.0;
    const dataUrl = offscreenCanvas.toDataURL(mime, quality);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `fayefoto-${config.layout}-${timestamp}.${format}`;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Generates a high-quality printable PDF formatted for standard photo paper.
   */
  public static async downloadPDF(
    photos: string[],
    config: PhotoStripConfig
  ): Promise<void> {
    const offscreenCanvas = document.createElement('canvas');
    await PhotoStripRenderer.renderToCanvas(offscreenCanvas, {
      photos,
      config,
      exportScale: 2.0, // High DPI render for print
    });

    const imgData = offscreenCanvas.toDataURL('image/jpeg', 0.95);
    const canvasW = offscreenCanvas.width;
    const canvasH = offscreenCanvas.height;

    // Use standard 4x6 inch (101.6 x 152.4 mm) photo print or custom strip size
    const isVerticalStrip = config.layout === 'vertical-1x4';
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isVerticalStrip ? [70, 210] : [100, 150], // Standard photobooth strip or 4x6"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect-ratio fit with 4mm border margin
    const margin = 4;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    const imgAspect = canvasW / canvasH;
    let targetW = maxW;
    let targetH = maxW / imgAspect;

    if (targetH > maxH) {
      targetH = maxH;
      targetW = maxH * imgAspect;
    }

    const posX = (pageWidth - targetW) / 2;
    const posY = (pageHeight - targetH) / 2;

    pdf.addImage(imgData, 'JPEG', posX, posY, targetW, targetH);
    pdf.save(`fayefoto-print-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /**
   * Generates a QR Code data URL encoding the temporary local URL or share ID.
   */
  public static async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data, {
      margin: 2,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  }
}
