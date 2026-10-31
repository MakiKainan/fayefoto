import { PhotoStripConfig, StripLayout } from '../types/photobooth';
import { FilterEngine } from './filterEngine';
import { drawPersonaTextOnCanvas } from '../persona/personaTextEngine';

export interface RenderOptions {
  photos: string[]; // array of base64/dataURL images
  config: PhotoStripConfig;
  exportScale?: number; // 1 for preview, 2 or 3 for high-DPI export
}

export class PhotoStripRenderer {
  /**
   * Helper to load an image source asynchronously into an HTMLImageElement
   */
  private static async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
      img.src = src;
    });
  }

  /**
   * Returns base canvas dimensions (width, height) for a given layout
   */
  public static getDimensions(layout: StripLayout, scale: number = 1): { width: number; height: number } {
    let baseW = 600;
    let baseH = 1800;

    switch (layout) {
      case 'vertical-1x4':
        baseW = 600;
        baseH = 1900;
        break;
      case 'grid-2x2':
        baseW = 1200;
        baseH = 1400;
        break;
      case 'classic-2x1':
        baseW = 800;
        baseH = 1200;
        break;
    }

    return {
      width: Math.round(baseW * scale),
      height: Math.round(baseH * scale),
    };
  }

  /**
   * Renders the complete multi-layer photo strip to an HTMLCanvasElement
   */
  public static async renderToCanvas(
    canvas: HTMLCanvasElement,
    options: RenderOptions
  ): Promise<void> {
    const { photos, config, exportScale = 1 } = options;
    const { width, height } = this.getDimensions(config.layout, exportScale);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not obtain 2D rendering context');

    // Make sure Anton / JetBrains Mono are ready so captions don't render in a fallback font
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    ctx.save();

    // 1. Draw Frame Background
    this.drawBackground(ctx, width, height, config);

    // 2. Load all photo images in parallel
    const loadedImages = await Promise.all(
      photos.map((src) => this.loadImage(src))
    );

    // 3. Draw Photos according to layout
    this.drawPhotos(ctx, loadedImages, width, height, config, exportScale);

    // 4. Draw Custom Borders (e.g., film sprockets, neon glow)
    this.drawBorderDetails(ctx, width, height, config, exportScale);

    // 5. Load and Draw Stickers (supporting high-DPI vector SVG assets)
    const stickerImages = await Promise.all(
      (config.stickers || []).map(async (st) => {
        if (!st.dataUrl) return null;
        try {
          return await this.loadImage(st.dataUrl);
        } catch {
          return null;
        }
      })
    );
    this.drawStickers(ctx, width, height, config, exportScale, stickerImages);

    // 6. Draw Captions & Date Footer using LzxHahaha/persona5 BoxText Engine
    this.drawFooterTypography(ctx, width, height, config, exportScale);

    ctx.restore();
  }

  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: PhotoStripConfig
  ): void {
    const { theme } = config;
    const RED = '#E5191C';
    const BLACK = '#0F0F0F';
    const WHITE = '#FDFDFD';

    const poly = (color: string, pts: [number, number][]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * width, y * height) : ctx.lineTo(x * width, y * height)));
      ctx.closePath();
      ctx.fill();
    };

    // Flat Persona 5 vector backgrounds: solid fills, hard diagonal slabs, halftone
    if (theme.id === 'persona-crimson') {
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, width, height);
      poly(RED, [[0, 0.86], [1, 0.8], [1, 1], [0, 1]]);
      poly(RED, [[0.62, 0], [1, 0], [1, 0.07]]);
      this.drawHalftone(ctx, 0, height * 0.8, width, height * 0.2, BLACK, width);
      poly(BLACK, [[0, 0.93], [1, 0.9], [1, 0.905], [0, 0.935]]);
      this.drawStar(ctx, width * 0.9, height * 0.03, width * 0.07, WHITE, BLACK);
      return;
    }

    if (theme.id === 'calling-card') {
      ctx.fillStyle = RED;
      ctx.fillRect(0, 0, width, height);
      this.drawHalftone(ctx, 0, 0, width, height, BLACK, width, 0.18);
      poly(BLACK, [[0, 0.84], [1, 0.88], [1, 1], [0, 1]]);
      poly(WHITE, [[0, 0.835], [1, 0.875], [1, 0.882], [0, 0.842]]);
      this.drawStar(ctx, width * 0.1, height * 0.025, width * 0.06, BLACK, WHITE);
      this.drawStar(ctx, width * 0.9, height * 0.97, width * 0.05, RED, WHITE);
      return;
    }

    if (theme.id === 'shibuya-white') {
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, width, height);
      poly(BLACK, [[0, 0.88], [1, 0.82], [1, 1], [0, 1]]);
      poly(RED, [[0, 0.875], [1, 0.815], [1, 0.83], [0, 0.89]]);
      poly(RED, [[0, 0], [0.3, 0], [0, 0.06]]);
      this.drawHalftone(ctx, width * 0.55, 0, width * 0.45, height * 0.05, BLACK, width, 0.5);
      return;
    }

    if (theme.id === 'fallen-angels') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#021207');
      grad.addColorStop(0.35, '#062614');
      grad.addColorStop(0.7, '#004d2b');
      grad.addColorStop(1, '#011408');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  private static drawHalftone(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    stripWidth: number,
    alpha = 0.35
  ): void {
    const step = stripWidth / 60;
    const r = step * 0.28;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let py = y + step / 2; py < y + h; py += step) {
      for (let px = x + step / 2; px < x + w; px += step) {
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, Math.PI * 2);
      }
    }
    ctx.fill();
    ctx.restore();
  }

  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outer: number,
    fill: string,
    stroke: string
  ): void {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : outer * 0.45;
      const a = ((-90 + i * 36) * Math.PI) / 180;
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = outer * 0.12;
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = stroke;
    ctx.stroke();
    ctx.restore();
  }

  private static drawPhotos(
    ctx: CanvasRenderingContext2D,
    images: HTMLImageElement[],
    totalW: number,
    totalH: number,
    config: PhotoStripConfig,
    scale: number
  ): void {
    const paddingX = 40 * scale;
    const paddingY = 48 * scale;
    const footerH = 180 * scale;
    const usableW = totalW - paddingX * 2;
    const usableH = totalH - paddingY - footerH;

    const cornerRadius = config.borderStyle === 'rounded' ? 24 * scale : 0;

    const renderSinglePhoto = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      // Hard offset slab behind each photo (comic panel look)
      ctx.save();
      ctx.fillStyle = config.theme.accentColor;
      ctx.beginPath();
      ctx.roundRect(x + 8 * scale, y + 8 * scale, w, h, cornerRadius);
      ctx.fill();
      ctx.restore();

      ctx.save();

      // Rounded photo clip path
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, cornerRadius);
      ctx.clip();

      // Apply Filter
      if (config.filter !== 'normal') {
        ctx.filter = FilterEngine.getCSSFilter(config.filter);
      }

      // Draw with aspect ratio cover (center crop)
      const imgAspect = img.width / img.height;
      const targetAspect = w / h;
      let drawW = w;
      let drawH = h;
      let offsetX = x;
      let offsetY = y;

      if (imgAspect > targetAspect) {
        drawW = h * imgAspect;
        offsetX = x - (drawW - w) / 2;
      } else {
        drawH = w / imgAspect;
        offsetY = y - (drawH - h) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // Photo frame inner border
      ctx.save();
      ctx.lineWidth = (config.borderStyle === 'neon-glow' ? 6 : 3) * scale;
      ctx.strokeStyle = config.theme.borderColor || 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, cornerRadius);
      ctx.stroke();
      ctx.restore();
    };

    if (config.layout === 'vertical-1x4') {
      const photoCount = Math.min(images.length, 4);
      const gapY = 24 * scale;
      const photoH = (usableH - gapY * (photoCount - 1)) / photoCount;
      const photoW = usableW;

      images.slice(0, 4).forEach((img, i) => {
        const y = paddingY + i * (photoH + gapY);
        renderSinglePhoto(img, paddingX, y, photoW, photoH);
      });
    } else if (config.layout === 'grid-2x2') {
      const gap = 24 * scale;
      const photoW = (usableW - gap) / 2;
      const photoH = (usableH - gap) / 2;

      images.slice(0, 4).forEach((img, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = paddingX + col * (photoW + gap);
        const y = paddingY + row * (photoH + gap);
        renderSinglePhoto(img, x, y, photoW, photoH);
      });
    } else if (config.layout === 'classic-2x1') {
      const photoCount = Math.min(images.length, 2);
      const gapY = 28 * scale;
      const photoH = (usableH - gapY * (photoCount - 1)) / photoCount;
      const photoW = usableW;

      images.slice(0, 2).forEach((img, i) => {
        const y = paddingY + i * (photoH + gapY);
        renderSinglePhoto(img, paddingX, y, photoW, photoH);
      });
    }
  }

  private static drawBorderDetails(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: PhotoStripConfig,
    scale: number
  ): void {
    if (config.borderStyle === 'film-strip') {
      // Draw film sprocket holes along left and right borders
      const holeW = 12 * scale;
      const holeH = 18 * scale;
      const holeGap = 28 * scale;
      const margin = 12 * scale;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      for (let y = margin; y < height - margin; y += holeH + holeGap) {
        ctx.beginPath();
        ctx.roundRect(margin, y, holeW, holeH, 3 * scale);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(width - margin - holeW, y, holeW, holeH, 3 * scale);
        ctx.fill();
      }
      ctx.restore();
    } else if (config.borderStyle === 'neon-glow') {
      // Comic outline: hard black/white double frame, no blur
      ctx.save();
      ctx.lineJoin = 'miter';
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = '#0F0F0F';
      ctx.strokeRect(7 * scale, 7 * scale, width - 14 * scale, height - 14 * scale);
      ctx.lineWidth = 5 * scale;
      ctx.strokeStyle = '#FDFDFD';
      ctx.strokeRect(16 * scale, 16 * scale, width - 32 * scale, height - 32 * scale);
      ctx.restore();
    }
  }

  private static drawStickers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: PhotoStripConfig,
    scale: number,
    images: (HTMLImageElement | null)[]
  ): void {
    if (!config.stickers || config.stickers.length === 0) return;

    config.stickers.forEach((sticker, i) => {
      ctx.save();
      const x = (sticker.xPercent / 100) * width;
      const y = (sticker.yPercent / 100) * height;

      ctx.translate(x, y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);

      const img = images[i];
      if (img) {
        // Draw crisp Persona vector art SVG
        const size = 70 * sticker.scale * scale;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 8 * scale;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        const fontSize = 48 * sticker.scale * scale;
        ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, 0, 0);
      }

      ctx.restore();
    });
  }

  private static drawFooterTypography(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: PhotoStripConfig,
    scale: number
  ): void {
    const footerY = height - 120 * scale;

    ctx.save();

    // Main Caption using LzxHahaha/persona5 BoxText Cutout Engine
    drawPersonaTextOnCanvas(ctx, config.caption, width / 2, footerY, {
      fontSize: 26 * scale,
      fontFamily: "'Anton', 'Bebas Neue', 'Impact', sans-serif",
    });

    // Date & Photobooth Watermark
    ctx.textAlign = 'center';
    ctx.font = `bold ${15 * scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = `${config.theme.textColor}CC`; // 80% opacity
    ctx.letterSpacing = '2px';
    ctx.fillText(`• ${config.dateText} •`, width / 2, footerY + 44 * scale);

    // Subtle Brand Dot
    ctx.fillStyle = config.theme.accentColor || '#E5191C';
    ctx.beginPath();
    ctx.arc(width / 2, footerY + 68 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
