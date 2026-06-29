export function getTourUnitPrice(tour: {
  price: number;
  discountPrice?: number | null;
}) {
  const price = tour.price;
  const discount = tour.discountPrice ?? null;
  return discount && discount < price ? discount : price;
}

/** Children pay 70% of adult price — industry-standard assumption */
export function calculateBookingTotal(
  unitPrice: number,
  adults: number,
  children: number
) {
  const childPrice = unitPrice * 0.7;
  return adults * unitPrice + children * childPrice;
}

export function toCents(amount: number) {
  return Math.round(amount * 100);
}
