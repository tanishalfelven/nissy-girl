export const roundHundredths = (n) => Math.floor(n * 100) / 100; 

export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export const wrap = (value, min, max) => {
    const range = max - min;
    return ((value - min) % range + range) % range + min;
};

export const inRange = (num, min, max) =>
    min <= num && num <= max;
