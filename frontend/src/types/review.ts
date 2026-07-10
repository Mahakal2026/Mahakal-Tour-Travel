export interface Review {
  _id: string;
  customerName: string;
  titleLocation?: string;
  initials?: string;
  rating: number;
  reviewText: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
