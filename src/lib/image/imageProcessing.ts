import type { ImageFilters } from './types';
import { rgbToHsl, hslToRgb } from './colorTransform';

export function updateImage(
    editedCanvas: HTMLCanvasElement,
    editedCtx: CanvasRenderingContext2D,
    imageElement: HTMLImageElement,
    filters: ImageFilters,
    imageLoaded: boolean
) {
    if (!imageLoaded || !editedCtx || !imageElement) return;

    editedCtx.clearRect(0, 0, editedCanvas.width, editedCanvas.height);
    editedCtx.drawImage(imageElement, 0, 0, editedCanvas.width, editedCanvas.height);

    const imageData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
    const pixelData = imageData.data;

    applyBasicFilters(pixelData, filters);
    applyCreativeFilters(pixelData, editedCanvas, filters);
    applyAdvancedFilters(pixelData, editedCanvas, filters);

    editedCtx.putImageData(imageData, 0, 0);
}

function applyBasicFilters(pixelData: Uint8ClampedArray, filters: ImageFilters) {
    for (let pixelIndex = 0; pixelIndex < pixelData.length; pixelIndex += 4) {
        const exposureFactor = Math.pow(2, filters.exposure / 100);
        pixelData[pixelIndex] = Math.min(255, Math.max(0, pixelData[pixelIndex] * exposureFactor));
        pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, pixelData[pixelIndex + 1] * exposureFactor));
        pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, pixelData[pixelIndex + 2] * exposureFactor));

        const brightnessFactor = 1 + filters.brightness / 50;
        pixelData[pixelIndex] = Math.min(255, Math.max(0, pixelData[pixelIndex] * brightnessFactor));
        pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, pixelData[pixelIndex + 1] * brightnessFactor));
        pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, pixelData[pixelIndex + 2] * brightnessFactor));

        const contrastFactor = (filters.contrast + 100) / 100;
        const contrastAdjusted = (value: number) => ((value / 255 - 0.5) * contrastFactor + 0.5) * 255;

        pixelData[pixelIndex] = Math.min(255, Math.max(0, contrastAdjusted(pixelData[pixelIndex])));
        pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, contrastAdjusted(pixelData[pixelIndex + 1])));
        pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, contrastAdjusted(pixelData[pixelIndex + 2])));

        const highlightsFactor = filters.highlights / 100;
        const shadowsFactor = filters.shadows / 100;

        const pixelLuminance = (0.299 * pixelData[pixelIndex] + 0.587 * pixelData[pixelIndex + 1] + 0.114 * pixelData[pixelIndex + 2]) / 255;

        const highlightAdjust = (value: number) => value * (1 + highlightsFactor * (1 - pixelLuminance) * 2);
        const shadowAdjust = (value:number) => value * (1+ shadowsFactor * pixelLuminance * 2);
        if (pixelLuminance > 0.5) {
            pixelData[pixelIndex] =   Math.min(255, Math.max(0, highlightAdjust(pixelData[pixelIndex])));
            pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, highlightAdjust(pixelData[pixelIndex + 1])));
            pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, highlightAdjust(pixelData[pixelIndex + 2])));
        } else {
            pixelData[pixelIndex] = Math.min(255, Math.max(0, shadowAdjust(pixelData[pixelIndex])));
            pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, shadowAdjust(pixelData[pixelIndex + 1])));
            pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, shadowAdjust(pixelData[pixelIndex + 2])));
        }

        let [hue, saturation, lightness] = rgbToHsl(pixelData[pixelIndex], pixelData[pixelIndex + 1], pixelData[pixelIndex + 2]);
        saturation = Math.min(1, Math.max(0, saturation * (1 + filters.saturation / 100)));

        const vibranceFactor = filters.vibrance / 100;
        const channelAverage = (pixelData[pixelIndex] + pixelData[pixelIndex + 1] + pixelData[pixelIndex + 2]) / 3;
        const maxChannel = Math.max(pixelData[pixelIndex], pixelData[pixelIndex + 1], pixelData[pixelIndex + 2]);
        const vibranceAdjustment = (maxChannel - channelAverage) * (-vibranceFactor * 3);

        pixelData[pixelIndex] += pixelData[pixelIndex] !== maxChannel ? vibranceAdjustment : 0;
        pixelData[pixelIndex + 1] += pixelData[pixelIndex + 1] !== maxChannel ? vibranceAdjustment : 0;
        pixelData[pixelIndex + 2] += pixelData[pixelIndex + 2] !== maxChannel ? vibranceAdjustment : 0;


        hue += filters.hue / 360;
        hue = (hue % 1 + 1) % 1;

        const temperatureFactor = filters.temperature / 100;
        const tempAdjustedRed = pixelData[pixelIndex] + temperatureFactor * 255;
        const tempAdjustedBlue = pixelData[pixelIndex + 2] - temperatureFactor * 255;

        pixelData[pixelIndex] = Math.min(255, Math.max(0,tempAdjustedRed));
        pixelData[pixelIndex+2] = Math.min(255, Math.max(0, tempAdjustedBlue));

        const [red, green, blue] = hslToRgb(hue, saturation, lightness);
        pixelData[pixelIndex] = Math.min(255, Math.max(0, red));
        pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, green));
        pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, blue));
    }
}

function applyCreativeFilters(
    pixelData: Uint8ClampedArray,
    canvas: HTMLCanvasElement,
    filters: ImageFilters
) {
    const originalPixelData = new Uint8ClampedArray(pixelData);

    if (filters.blur > 0) {
        applyBlur(pixelData, originalPixelData, canvas, filters.blur);
    }

    for (let pixelIndex = 0; pixelIndex < pixelData.length; pixelIndex += 4) {
        if (filters.sepia > 0) {
            const sepiaIntensity = filters.sepia / 100;
            const red = pixelData[pixelIndex];
            const green = pixelData[pixelIndex + 1];
            const blue = pixelData[pixelIndex + 2];

            pixelData[pixelIndex] = Math.min(255, (red * (1 - sepiaIntensity)) + ((red * 0.393 + green * 0.769 + blue * 0.189) * sepiaIntensity));
            pixelData[pixelIndex + 1] = Math.min(255, (green * (1 - sepiaIntensity)) + ((red * 0.349 + green * 0.686 + blue * 0.168) * sepiaIntensity));
            pixelData[pixelIndex + 2] = Math.min(255, (blue * (1 - sepiaIntensity)) + ((red * 0.272 + green * 0.534 + blue * 0.131) * sepiaIntensity));
        }

        if (filters.grayscale > 0) {
            const grayscaleIntensity = filters.grayscale / 100;
            const grayValue = (pixelData[pixelIndex] * 0.299 + pixelData[pixelIndex + 1] * 0.587 + pixelData[pixelIndex + 2] * 0.114);
            pixelData[pixelIndex] = pixelData[pixelIndex] * (1 - grayscaleIntensity) + grayValue * grayscaleIntensity;
            pixelData[pixelIndex + 1] = pixelData[pixelIndex + 1] * (1 - grayscaleIntensity) + grayValue * grayscaleIntensity;
            pixelData[pixelIndex + 2] = pixelData[pixelIndex + 2] * (1 - grayscaleIntensity) + grayValue * grayscaleIntensity;
        }

        if (filters.invert > 0) {
            const invertIntensity = filters.invert / 100;
            pixelData[pixelIndex] = pixelData[pixelIndex] * (1 - invertIntensity) + (255 - pixelData[pixelIndex]) * invertIntensity;
            pixelData[pixelIndex + 1] = pixelData[pixelIndex + 1] * (1 - invertIntensity) + (255 - pixelData[pixelIndex + 1]) * invertIntensity;
            pixelData[pixelIndex + 2] = pixelData[pixelIndex + 2] * (1 - invertIntensity) + (255 - pixelData[pixelIndex + 2]) * invertIntensity;
        }

        if (filters.noise > 0) {
            const noiseIntensity = filters.noise / 100;
            const noiseValue = (Math.random() - 0.5) * noiseIntensity * 255;
            pixelData[pixelIndex] = Math.min(255, Math.max(0, pixelData[pixelIndex] + noiseValue));
            pixelData[pixelIndex + 1] = Math.min(255, Math.max(0, pixelData[pixelIndex + 1] + noiseValue));
            pixelData[pixelIndex + 2] = Math.min(255, Math.max(0, pixelData[pixelIndex + 2] + noiseValue));
        }
    }

    if (filters.pixelate > 0) {
        applyPixelate(pixelData, canvas, filters.pixelate);
    }

    if (filters.glitchIntensity > 0) {
        applyGlitch(pixelData, canvas, filters.glitchIntensity, filters.glitchOffset);
    }
}

function applyAdvancedFilters(
    pixelData: Uint8ClampedArray,
    canvas: HTMLCanvasElement,
    filters: ImageFilters
) {
    if (filters.dreamEffect > 0) {
        applyDreamEffect(pixelData, canvas, filters.dreamEffect);
    }

    if (filters.mosaicSize > 0) {
        applyMosaic(pixelData, canvas, filters.mosaicSize);
    }

    if (filters.pencilEffect > 0) {
        applyPencilEffect(pixelData, canvas, filters.pencilEffect);
    }

    if (filters.watercolorEffect > 0) {
        applyWatercolorEffect(pixelData, canvas, filters.watercolorEffect);
    }
}

function applyBlur(targetData: Uint8ClampedArray, sourceData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const blurRadius = Math.max(0, Math.floor(intensity / 2));

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            let redSum = 0, greenSum = 0, blueSum = 0, pixelCount = 0;

            for (let offsetY = -blurRadius; offsetY <= blurRadius; offsetY++) {
                for (let offsetX = -blurRadius; offsetX <= blurRadius; offsetX++) {
                    const neighborX = x + offsetX;
                    const neighborY = y + offsetY;

                    if (neighborX >= 0 && neighborX < canvas.width && neighborY >= 0 && neighborY < canvas.height) {
                        const neighborIndex = (neighborY * canvas.width + neighborX) * 4;
                        redSum += sourceData[neighborIndex];
                        greenSum += sourceData[neighborIndex + 1];
                        blueSum += sourceData[neighborIndex + 2];
                        pixelCount++;
                    }
                }
            }

            targetData[pixelIndex] = Math.round(redSum / pixelCount);
            targetData[pixelIndex + 1] = Math.round(greenSum / pixelCount);
            targetData[pixelIndex + 2] = Math.round(blueSum / pixelCount);
        }
    }
}

function applyPixelate(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const pixelSize = Math.max(1, Math.floor(intensity / 5));

    for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            let redSum = 0, greenSum = 0, blueSum = 0;
            let pixelCount = 0;

            for (let blockY = 0; blockY < pixelSize && y + blockY < canvas.height; blockY++) {
                for (let blockX = 0; blockX < pixelSize && x + blockX < canvas.width; blockX++) {
                    const pixelIndex = ((y + blockY) * canvas.width + (x + blockX)) * 4;
                    redSum += pixelData[pixelIndex];
                    greenSum += pixelData[pixelIndex + 1];
                    blueSum += pixelData[pixelIndex + 2];
                    pixelCount++;
                }
            }

            const avgRed = Math.round(redSum / pixelCount);
            const avgGreen = Math.round(greenSum / pixelCount);
            const avgBlue = Math.round(blueSum / pixelCount);

            for (let blockY = 0; blockY < pixelSize && y + blockY < canvas.height; blockY++) {
                for (let blockX = 0; blockX < pixelSize && x + blockX < canvas.width; blockX++) {
                    const pixelIndex = ((y + blockY) * canvas.width + (x + blockX)) * 4;
                    pixelData[pixelIndex] = avgRed;
                    pixelData[pixelIndex + 1] = avgGreen;
                    pixelData[pixelIndex + 2] = avgBlue;
                }
            }
        }
    }
}

function applyGlitch(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number, offset: number) {
    const glitchProbability = intensity / 100;
    const pixelOffset = Math.max(0,Math.floor(offset * canvas.width / 100));

    for (let y = 0; y < canvas.height; y++) {
        if (Math.random() < glitchProbability * 0.1) {
            for (let x = 0; x < canvas.width; x++) {
                const sourceIndex = (y * canvas.width + x) * 4;
                const targetIndex = (y * canvas.width + Math.min(canvas.width -1 ,x + pixelOffset)) * 4;

                                if(x + pixelOffset < canvas.width){
                    pixelData[targetIndex] = pixelData[sourceIndex];
                    pixelData[targetIndex + 1] = pixelData[sourceIndex + 1];
                    pixelData[targetIndex + 2] = pixelData[sourceIndex + 2];
                }
            }
        }
    }
}

function applyDreamEffect(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const effectRadius = Math.max(0, Math.floor(intensity / 2));
    const effectStrength = intensity / 100;
    const originalPixelData = new Uint8ClampedArray(pixelData);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            let redSum = 0, greenSum = 0, blueSum = 0;
            let weightSum = 0;

            for (let offsetY = -effectRadius; offsetY <= effectRadius; offsetY++) {
                for (let offsetX = -effectRadius; offsetX <= effectRadius; offsetX++) {
                    const neighborX = x + offsetX;
                    const neighborY = y + offsetY;

                    if (neighborX >= 0 && neighborX < canvas.width && neighborY >= 0 && neighborY < canvas.height) {
                        const neighborIndex = (neighborY * canvas.width + neighborX) * 4;
                        const weight = Math.exp(-(offsetX * offsetX + offsetY * offsetY) / (2 * effectRadius * effectRadius));

                        redSum += originalPixelData[neighborIndex] * weight;
                        greenSum += originalPixelData[neighborIndex + 1] * weight;
                        blueSum += originalPixelData[neighborIndex + 2] * weight;
                        weightSum += weight;
                    }
                }
            }

            pixelData[pixelIndex] = Math.round(originalPixelData[pixelIndex] * (1 - effectStrength) + (redSum / weightSum) * effectStrength);
            pixelData[pixelIndex + 1] = Math.round(originalPixelData[pixelIndex + 1] * (1 - effectStrength) + (greenSum / weightSum) * effectStrength);
            pixelData[pixelIndex + 2] = Math.round(originalPixelData[pixelIndex + 2] * (1 - effectStrength) + (blueSum / weightSum) * effectStrength);
        }
    }
}

function applyMosaic(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const tileSize = Math.max(2, Math.floor(intensity / 2));
    const tilesX = Math.ceil(canvas.width / tileSize);
    const tilesY = Math.ceil(canvas.height / tileSize);

    for (let tileY = 0; tileY < tilesY; tileY++) {
        for (let tileX = 0; tileX < tilesX; tileX++) {
            const tileColors = [];

            for (let y = tileY * tileSize; y < (tileY + 1) * tileSize && y < canvas.height; y++) {
                for (let x = tileX * tileSize; x < (tileX + 1) * tileSize && x < canvas.width; x++) {
                    const pixelIndex = (y * canvas.width + x) * 4;
                    tileColors.push([
                        pixelData[pixelIndex],
                        pixelData[pixelIndex + 1],
                        pixelData[pixelIndex + 2]
                    ]);
                }
            }

            const averageColor = tileColors.reduce(
                (sum, color) => [
                    sum[0] + color[0] / tileColors.length,
                    sum[1] + color[1] / tileColors.length,
                    sum[2] + color[2] / tileColors.length
                ],
                [0, 0, 0]
            );

            for (let y = tileY * tileSize; y < (tileY + 1) * tileSize && y < canvas.height; y++) {
                for (let x = tileX * tileSize; x < (tileX + 1) * tileSize && x < canvas.width; x++) {
                    const pixelIndex = (y * canvas.width + x) * 4;
                    pixelData[pixelIndex] = Math.round(averageColor[0]);
                    pixelData[pixelIndex + 1] = Math.round(averageColor[1]);
                    pixelData[pixelIndex + 2] = Math.round(averageColor[2]);
                }
            }
        }
    }
}

function applyPencilEffect(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const effectStrength = intensity / 100;
    const originalPixelData = new Uint8ClampedArray(pixelData);

    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;

            const gradientX = -originalPixelData[pixelIndex - 4] + originalPixelData[pixelIndex + 4];
            const gradientY = -originalPixelData[pixelIndex - canvas.width * 4] + originalPixelData[pixelIndex + canvas.width * 4];

            const edgeStrength = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
            const clampedEdgeStrength = Math.min(255, edgeStrength);

            pixelData[pixelIndex] = Math.round(originalPixelData[pixelIndex] * (1 - effectStrength) + (255 - clampedEdgeStrength) * effectStrength);
            pixelData[pixelIndex + 1] = Math.round(originalPixelData[pixelIndex + 1] * (1 - effectStrength) + (255 - clampedEdgeStrength) * effectStrength);
            pixelData[pixelIndex + 2] = Math.round(originalPixelData[pixelIndex + 2] * (1 - effectStrength) + (255 - clampedEdgeStrength) * effectStrength);
        }
    }
}

function applyWatercolorEffect(pixelData: Uint8ClampedArray, canvas: HTMLCanvasElement, intensity: number) {
    const kernelSize = Math.max(1, Math.floor(intensity / 10));
    const effectStrength = intensity / 100;
    const originalPixelData = new Uint8ClampedArray(pixelData);

    for (let y = kernelSize; y < canvas.height - kernelSize; y++) {
        for (let x = kernelSize; x < canvas.width - kernelSize; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            const neighborColors = [];

            for (let offsetY = -kernelSize; offsetY <= kernelSize; offsetY++) {
                for (let offsetX = -kernelSize; offsetX <= kernelSize; offsetX++) {
                    const neighborIndex = ((y + offsetY) * canvas.width + (x + offsetX)) * 4;
                    neighborColors.push([
                        originalPixelData[neighborIndex],
                        originalPixelData[neighborIndex + 1],
                        originalPixelData[neighborIndex + 2]
                    ]);
                }
            }

            neighborColors.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
            const medianIndex = Math.floor(neighborColors.length / 2);

            pixelData[pixelIndex] = Math.round(originalPixelData[pixelIndex] * (1 - effectStrength) + neighborColors[medianIndex][0] * effectStrength);
            pixelData[pixelIndex + 1] = Math.round(originalPixelData[pixelIndex + 1] * (1 - effectStrength) + neighborColors[medianIndex][1] * effectStrength);
            pixelData[pixelIndex + 2] = Math.round(originalPixelData[pixelIndex + 2] * (1 - effectStrength) + neighborColors[medianIndex][2] * effectStrength);
        }
    }
}