interface Priced {
  price: number | string;
  sale_price?: number | string | null;
}

/** The price a customer pays: the sale price when it is set and lower than the normal price. */
export function effectivePrice(p: Priced): number {
  const price = Number(p.price);
  const sale = p.sale_price == null ? null : Number(p.sale_price);
  return sale !== null && Number.isFinite(sale) && sale >= 0 && sale < price ? sale : price;
}

export const onSale = (p: Priced) => effectivePrice(p) < Number(p.price);

export const formatRupees = (n: number) => `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`;
