export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address?: string;
  floor: string;
  validRadius: number;
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
}

export interface ImageType {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

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
  items: OrderItem[];
  user: User;
  paid: boolean;
  deliveryTime: string;
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
  products: Product[];
};