export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address?: string;
  floor: string;
  validRadius: number;
  comment: string;
  bellName: string;
  defaultTime: number;
  distanceToDestination: number;
};

export interface Ingredient {
  id: number;
  name: string;
  price: number;
  ingredient?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface Option {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
  delete?: boolean;
}

export interface IngCategory {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
  delete?: boolean;
  onlyOne?: boolean;
}

export interface ImageType {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

export type WeeklyIntervals = Record<string, Interval[]>;

export interface Interval { 
  id: number; 
  open: string; 
  close: string, 
  isAfterMidnight: boolean 
};

export interface Override {
  id: number;
  date: string;
  intervals: Interval[];
  everyYear?: boolean;
};

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  offer: boolean;
  offerPrice?: number;
  description: string;
  image?: ImageType | null;
  imageId?: number | null;
  ingCategories?: IngCategory[];
  options?: Option[];
  intervals: WeeklyIntervals;
}

export interface OrderItem {
  id?: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  ingredients?: Ingredient[];
  selectedIngredients: Ingredient[];
  selectedIngCategories?: IngCategory[];
  selectedOptions: Option[];
  options?: Option[];
  product?: Product;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  acceptedAt?: string;
  items: OrderItem[];
  user: User;
  paid: boolean;
  paidIn?: string;
  deliveryTime: string;
  payment_intent_id: string;
}

export interface MessageItem {
  id: number;
  content: string;
  senderEmail: string;
  createdAt: Date;
};

export interface Category {
  id: number;
  name: string;
  position?: number;
  products: Product[];
  intervals: WeeklyIntervals;
};

// Enum for days of the week
export enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}
