import { supabaseBrowser } from './supabaseBrowser';
import type { ProductFormInput, ProductRow, ProductStatus } from './types';

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabaseBrowser.auth.getUser();
  if (error || !data.user) throw new Error('로그인이 필요합니다.');
  return data.user.id;
}

export async function listMyProducts(): Promise<ProductRow[]> {
  const userId = await requireUserId();
  const { data, error } = await supabaseBrowser
    .from('products')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function createProduct(input: ProductFormInput): Promise<ProductRow> {
  const userId = await requireUserId();

  const payload = {
    seller_id: userId,
    title: input.title,
    description: input.description ?? null,
    price_krw: input.price_krw ?? null,
    total_quantity: input.total_quantity ?? null,
    remaining_quantity: input.remaining_quantity ?? input.total_quantity ?? null,
    status: (input.status ?? 'open') as ProductStatus,
  };

  const { data, error } = await supabaseBrowser
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function getProductById(productId: string): Promise<ProductRow> {
  const { data, error } = await supabaseBrowser
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function updateProduct(productId: string, input: ProductFormInput): Promise<ProductRow> {
  await requireUserId();

  const patch = {
    title: input.title,
    description: input.description ?? null,
    price_krw: input.price_krw ?? null,
    total_quantity: input.total_quantity ?? null,
    remaining_quantity: input.remaining_quantity ?? input.total_quantity ?? null,
    status: (input.status ?? 'open') as ProductStatus,
  };

  const { data, error } = await supabaseBrowser
    .from('products')
    .update(patch)
    .eq('id', productId)
    .select('*')
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function closeProduct(productId: string): Promise<void> {
  await requireUserId();
  const { error } = await supabaseBrowser
    .from('products')
    .update({ status: 'closed' })
    .eq('id', productId);

  if (error) throw error;
}

export async function reopenProduct(productId: string): Promise<void> {
  await requireUserId();
  const { error } = await supabaseBrowser
    .from('products')
    .update({ status: 'open' })
    .eq('id', productId);

  if (error) throw error;
}
