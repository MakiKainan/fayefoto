import { FilterType } from '../types/photobooth';

export class FilterEngine {
  /**
   * Returns hardware-accelerated CSS filter string for instant 60fps live camera preview.
   * Includes Fallen Angels color palette filters and Persona styling.
   */
  public static getCSSFilter(filter: FilterType): string {
    switch (filter) {
      case 'fallen-angels':
        // Based on fallenangels.jpg: Emerald jade green cast, high contrast, deep moody shadows
        return 'sepia(30%) hue-rotate(65deg) saturate(165%) contrast(135%) brightness(92%)';
      case 'fallen-neon':
        // Based on fallenangels2.jpg: Neon cyan-green glow, Christopher Doyle 90s Hong Kong night grading
        return 'sepia(20%) hue-rotate(95deg) saturate(200%) contrast(145%) brightness(95%)';
      case 'fallen-noir':
        // Based on fallenangels3.jpg: High contrast film noir monochrome, deep blacks, crisp highlights
        return 'grayscale(100%) contrast(165%) brightness(90%)';
      case 'fallen-amber':
        // Based on fallenangels4.jpg: Warm tungsten amber & late-night tobacco lighting, rich shadows
        return 'sepia(70%) hue-rotate(-25deg) saturate(175%) contrast(135%) brightness(88%)';
      case 'persona-crimson':
        // Persona 5 aesthetic: punchy contrast, red saturation, dark shadows
        return 'contrast(150%) brightness(95%) saturate(190%) hue-rotate(330deg)';
      case 'grayscale':
        return 'grayscale(100%) contrast(110%)';
      case 'vintage':
        return 'sepia(35%) contrast(115%) brightness(105%) saturate(140%) hue-rotate(-15deg)';
      case 'cyberpunk':
        return 'contrast(135%) saturate(180%) hue-rotate(185deg) brightness(105%)';
      case 'normal':
      default:
        return 'none';
    }
  }

  /**
   * Applies the exact image processing transformation to a canvas 2D context for final export.
   */
  public static applyCanvasFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filter: FilterType
  ): void {
    if (filter === 'normal') return;

    // Use fast canvas filter property if supported
    if ('filter' in (ctx as unknown as Record<string, unknown>)) {
      (ctx as unknown as { filter: string }).filter = FilterEngine.getCSSFilter(filter);
      return;
    }

    // Direct pixel data fallback
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (filter === 'grayscale' || filter === 'fallen-noir') {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (filter === 'fallen-noir') {
          // Extra contrast for Fallen Angels Noir
          gray = (gray - 128) * 1.65 + 128 - 15;
          gray = Math.max(0, Math.min(255, gray));
        }
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else if (filter === 'fallen-angels') {
        // Emerald / Jade tint based on fallenangels.jpg
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = Math.max(0, Math.min(255, gray * 0.45 + r * 0.25));
        data[i + 1] = Math.max(0, Math.min(255, gray * 0.7 + g * 0.75 + 20));
        data[i + 2] = Math.max(0, Math.min(255, gray * 0.5 + b * 0.35 + 10));
      } else if (filter === 'fallen-neon') {
        // Neon cyan-green based on fallenangels2.jpg
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = Math.max(0, Math.min(255, gray * 0.3 + r * 0.15));
        data[i + 1] = Math.max(0, Math.min(255, gray * 0.65 + g * 0.9 + 25));
        data[i + 2] = Math.max(0, Math.min(255, gray * 0.75 + b * 0.75 + 20));
      } else if (filter === 'fallen-amber') {
        // Tungsten amber based on fallenangels4.jpg
        data[i] = Math.min(255, r * 1.35 + 25);
        data[i + 1] = Math.min(255, g * 0.95 + 10);
        data[i + 2] = Math.max(0, b * 0.45);
      } else if (filter === 'persona-crimson') {
        // Persona 5 bold red contrast
        data[i] = Math.min(255, r * 1.4 + 30);
        data[i + 1] = Math.max(0, g * 0.65 - 10);
        data[i + 2] = Math.max(0, b * 0.7 - 10);
      } else if (filter === 'vintage') {
        data[i] = Math.min(255, r * 1.15 + 20);
        data[i + 1] = Math.min(255, g * 1.05 + 10);
        data[i + 2] = Math.max(0, b * 0.85);
      } else if (filter === 'cyberpunk') {
        data[i] = Math.min(255, (255 - r) * 0.4 + r * 0.8 + 40);
        data[i + 1] = Math.min(255, g * 0.9);
        data[i + 2] = Math.min(255, (255 - g) * 0.3 + b * 1.2 + 60);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
