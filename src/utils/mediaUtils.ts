export const getMediaTypeFromUrl = (url: string): "image" | "video" | null => {
    if (!url) return null;
  
    const extension = url.split(".").pop()?.toLowerCase();
  
    if (!extension) return null;
  
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "jfif"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
  
    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video";
  
    return null;
  };
  