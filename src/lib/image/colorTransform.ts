export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;

    const maxValue = Math.max(normalizedR, normalizedG, normalizedB);
    const minValue = Math.min(normalizedR, normalizedG, normalizedB);
    
    const lightness = (maxValue + minValue) / 2;
    
    let hue = 0;
    let saturation = 0;
    
    if (maxValue !== minValue) {
        const colorRange = maxValue - minValue;
        
        saturation = lightness > 0.5 
            ? colorRange / (2 - maxValue - minValue) 
            : colorRange / (maxValue + minValue);
            
        if (maxValue === normalizedR) {
            hue = ((normalizedG - normalizedB) / colorRange) + (normalizedG < normalizedB ? 6 : 0);
        } else if (maxValue === normalizedG) {
            hue = ((normalizedB - normalizedR) / colorRange) + 2;
        } else {
            hue = ((normalizedR - normalizedG) / colorRange) + 4;
        }
        
        hue /= 6;
    }

    return [hue, saturation, lightness];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
        const grayValue = Math.round(l * 255);
        return [grayValue, grayValue, grayValue];
    }
    
    const convertHueToRgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const red = convertHueToRgb(p, q, h + 1/3) * 255;
    const green = convertHueToRgb(p, q, h) * 255;
    const blue = convertHueToRgb(p, q, h - 1/3) * 255;
    
    return [red, green, blue];
}