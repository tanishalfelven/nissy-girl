export const roundHundredths = (n) => Math.floor(n * 100) / 100; 

export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);