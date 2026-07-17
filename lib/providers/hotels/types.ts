export type HotelAvailabilityOffer = {
  id: string;
  hotelId: string;
  name: string;
  city: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  board: string;
  pricePerNight: number;
  currency: "USD" | "PKR";
  provider: "sandbox" | "hotelbeds";
  refundable?: boolean;
};

export type HotelAvailabilityQuery = {
  city: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  hotelName?: string;
};
