import { WatermarkSelection } from '../../types/watermark';

/**
 * Simple inpainting algorithm using context-aware pixel filling
 * This is a basic implementation - in production, you'd use more sophisticated
 * algorithms or AI models for better results
 */
export class WatermarkRemovalService {
  /**
   * Remove watermark from image using inpainting
   */
  static async removeWatermark(
    imageUrl: string,
    selections: WatermarkSelection[],
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Process each selection
          for (let i = 0; i < selections.length; i++) {
            const selection = selections[i];

            // Calculate actual pixel coordinates
            const x = Math.floor(selection.x * img.width);
            const y = Math.floor(selection.y * img.height);
            const width = Math.floor(selection.width * img.width);
            const height = Math.floor(selection.height * img.height);

            // Apply inpainting
            await this.inpaintRegion(ctx, x, y, width, height);

            // Update progress
            if (onProgress) {
              onProgress(((i + 1) / selections.length) * 100);
            }
          }

          // Convert to blob and create URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Could not create blob from canvas'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Inpaint a region using context-aware filling
   * This uses a simple algorithm that samples surrounding pixels
   */
  private static async inpaintRegion(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    // Sampling radius (pixels around the region to sample from)
    const sampleRadius = Math.min(20, Math.floor(Math.min(width, height) / 4));

    // Get surrounding pixels for context
    const surroundingPixels: number[][] = [];

    // Sample top edge
    for (let i = -sampleRadius; i < width + sampleRadius; i++) {
      for (let j = -sampleRadius; j < 0; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < ctx.canvas.width && py >= 0 && py < ctx.canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          surroundingPixels.push([pixel[0], pixel[1], pixel[2], pixel[3]]);
        }
      }
    }

    // Sample bottom edge
    for (let i = -sampleRadius; i < width + sampleRadius; i++) {
      for (let j = height; j < height + sampleRadius; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < ctx.canvas.width && py >= 0 && py < ctx.canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          surroundingPixels.push([pixel[0], pixel[1], pixel[2], pixel[3]]);
        }
      }
    }

    // Sample left edge
    for (let i = -sampleRadius; i < 0; i++) {
      for (let j = 0; j < height; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < ctx.canvas.width && py >= 0 && py < ctx.canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          surroundingPixels.push([pixel[0], pixel[1], pixel[2], pixel[3]]);
        }
      }
    }

    // Sample right edge
    for (let i = width; i < width + sampleRadius; i++) {
      for (let j = 0; j < height; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < ctx.canvas.width && py >= 0 && py < ctx.canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          surroundingPixels.push([pixel[0], pixel[1], pixel[2], pixel[3]]);
        }
      }
    }

    if (surroundingPixels.length === 0) {
      // Fallback: fill with white if no surrounding pixels
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    } else {
      // Fill each pixel with a blend of surrounding pixels
      for (let i = 0; i < data.length; i += 4) {
        // Use multiple random samples for better blending
        const samples = 5;
        let r = 0, g = 0, b = 0, a = 0;

        for (let s = 0; s < samples; s++) {
          const randomPixel = surroundingPixels[Math.floor(Math.random() * surroundingPixels.length)];
          r += randomPixel[0];
          g += randomPixel[1];
          b += randomPixel[2];
          a += randomPixel[3];
        }

        data[i] = r / samples;
        data[i + 1] = g / samples;
        data[i + 2] = b / samples;
        data[i + 3] = a / samples;
      }

      // Apply gaussian blur for smoother result
      this.gaussianBlur(data, width, height, 2);
    }

    ctx.putImageData(imageData, x, y);
  }

  /**
   * Apply gaussian blur to image data
   */
  private static gaussianBlur(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number
  ): void {
    // Simple box blur approximation of gaussian blur
    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += tempData[idx];
              g += tempData[idx + 1];
              b += tempData[idx + 2];
              a += tempData[idx + 3];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
        data[idx + 3] = a / count;
      }
    }
  }

  /**
   * Detect watermarks automatically using AI
   * This is a placeholder - in production, you'd use a computer vision API
   */
  static async detectWatermarks(imageUrl: string): Promise<WatermarkSelection[]> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demonstration, detect bright or semi-transparent regions
    // In production, use a real AI model or vision API
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Simple detection: look for semi-transparent or very bright/dark regions
        const detections: WatermarkSelection[] = [];
        const gridSize = 32; // Check in 32x32 pixel blocks

        for (let y = 0; y < img.height; y += gridSize) {
          for (let x = 0; x < img.width; x += gridSize) {
            let transparentPixels = 0;
            let brightPixels = 0;
            let totalPixels = 0;

            for (let dy = 0; dy < gridSize && y + dy < img.height; dy++) {
              for (let dx = 0; dx < gridSize && x + dx < img.width; dx++) {
                const idx = ((y + dy) * img.width + (x + dx)) * 4;
                const alpha = data[idx + 3];
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                if (alpha < 200) transparentPixels++;
                if (brightness > 200 || brightness < 50) brightPixels++;
                totalPixels++;
              }
            }

            // If more than 30% of pixels are semi-transparent or very bright/dark
            if (transparentPixels > totalPixels * 0.3 || brightPixels > totalPixels * 0.5) {
              detections.push({
                x: x / img.width,
                y: y / img.height,
                width: Math.min(gridSize, img.width - x) / img.width,
                height: Math.min(gridSize, img.height - y) / img.height,
                type: 'auto',
              });
            }
          }
        }

        resolve(detections);
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = imageUrl;
    });
  }
}
