export interface Package {
  _id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  priceLabel?: string;
  inclusions: string[];
  image: string; // URL from API
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
