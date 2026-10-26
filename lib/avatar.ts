export const MAX_AVATAR_LENGTH = 120_000;

export function storedAvatar(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > MAX_AVATAR_LENGTH) return "too-large" as const;
  return trimmed;
}

export function displayAvatar(value?: string | null) {
  const stored = storedAvatar(value);
  return stored === "too-large" ? undefined : stored ?? undefined;
}

export function readImageFile(file: File, maxEdge = 256) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const source = String(reader.result ?? "");
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read that image."));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(source);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}
