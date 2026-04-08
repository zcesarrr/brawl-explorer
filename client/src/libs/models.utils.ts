export function getKbSize(bytes: number) {
    return Math.trunc(bytes / 1024);
}

export function getMbSize(bytes: number) {
    const factor = Math.pow(10, 2);
    return Math.trunc((bytes / 1024 / 1024) * factor) / factor;
}

export function getAutoSize(bytes: number) {
    if (bytes < 1024 * 1024) return getKbSize(bytes);

    return getMbSize(bytes);
}

export function getAutoSizeString(bytes: number) {
    const data = bytes < 1024 * 1024 ? "kb" : "mb";

    return `${getAutoSize(bytes)}${data}`;
}
