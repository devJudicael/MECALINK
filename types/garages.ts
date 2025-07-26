export type Garage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  isOpen: boolean;
  openingHours: string;
  description: string;
  distance?: number;
  skills?: string[];
};

export type Comment = {
  _id: string;
  garage: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};
