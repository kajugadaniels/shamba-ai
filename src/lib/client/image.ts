export const IMAGE_LIMIT = 3000000;
const formats = new Set(["image/jpeg", "image/png", "image/webp"]);
export async function prepareImage(file: File): Promise<File> {
  if (!formats.has(file.type) || !file.size) throw new Error("Choose a usable JPG, PNG, or WEBP photo.");
  let image: ImageBitmap | HTMLImageElement;
  let cleanup: () => void;
  try {
    if (typeof createImageBitmap === "function") { image = await createImageBitmap(file, { imageOrientation: "from-image" }); cleanup = () => (image as ImageBitmap).close(); }
    else {
      const url = URL.createObjectURL(file); const element = new Image(); element.src = url;
      try { await element.decode(); } catch { URL.revokeObjectURL(url); throw new Error(); }
      image = element; cleanup = () => URL.revokeObjectURL(url);
    }
  } catch { throw new Error("This photo could not be opened. Choose a clearer JPG, PNG, or WEBP photo."); }
  try {
    const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
    const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
    if (!width || !height) throw new Error("This photo could not be opened. Choose another photo.");
    if (file.size <= IMAGE_LIMIT) return file;
    const canvas = document.createElement("canvas");
    for (const [edge, quality] of [[2048,.90],[2048,.82],[2048,.74],[1600,.82],[1280,.82]]) {
      const scale = Math.min(1, edge / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d"); if (!context) throw new Error("Your browser could not prepare this photo. Choose a smaller photo.");
      context.fillStyle = "#F7F5EE"; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(image,0,0,canvas.width,canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob || blob.type !== "image/jpeg" || !blob.size) throw new Error("Your browser could not prepare this photo. Choose a smaller photo.");
      if (blob.size <= IMAGE_LIMIT) return new File([blob], "plant.jpg", { type: "image/jpeg" });
    }
    throw new Error("This photo is still larger than 3 MB. Choose a smaller or clearer photo.");
  } finally { cleanup(); }
}
