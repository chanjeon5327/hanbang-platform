export type ProductStatus = 'open' | 'closed' | 'ended';

export type ProductRow = {
  id: string;
  seller_id: string | null;
  title: string;
  description: string | null;

  price_krw: number | null;

  total_quantity: number | null;
  remaining_quantity: number | null;

  status: ProductStatus;

  created_at: string | null;
};

export type ProductFormInput = {
  title: string;
  description?: string;
  price_krw?: number;
  total_quantity?: number;
  remaining_quantity?: number;
  status?: ProductStatus;
};
