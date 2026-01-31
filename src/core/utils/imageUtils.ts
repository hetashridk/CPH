
export const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
});

/**
 * Converts a base64 Data URI to a Blob object for efficient storage uploads.
 */
export const dataUriToBlob = (dataUri: string): { blob: Blob; mimeType: string } => {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeType = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return { blob: new Blob([ab], { type: mimeType }), mimeType };
};

export const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) return reject(new Error("No result"));
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) { height *= maxSize / width; width = maxSize; }
                } else {
                    if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context failed'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

export const ensureBase64 = async (imageSrc: string): Promise<string> => {
    if (imageSrc.startsWith('data:')) return imageSrc;
    const response = await fetch(imageSrc, { cache: 'no-store', mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
