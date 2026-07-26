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
