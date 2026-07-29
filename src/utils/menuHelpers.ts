export function formatPrice(price: number | string): string {
  if (typeof price === "number") return `₹${price}`;
  
  if (price.includes("/")) {
    return price.split("/").map(p => {
      const cleaned = p.replace(/[^0-9.]/g, "").trim();
      return `₹${cleaned}`;
    }).join(" / ");
  }
  
  const cleaned = price.replace(/[^0-9.]/g, "").trim();
  return `₹${cleaned}`;
}

export function getNumericPrice(price: number | string): number {
  if (typeof price === "number") return price;
  const firstPart = price.split("/")[0].trim();
  const cleaned = firstPart.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  // Check if we are running in the admin portal during local development
  if (typeof window !== "undefined" && window.location.port === "5174") {
    // Prepend the main site host (localhost:5173) to resolve relative paths
    return `http://localhost:5173${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return url;
}
