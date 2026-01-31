import { supabaseBrowser } from './supabaseBrowser';
import type { ProductRow } from './types';

export async function listPublicProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabaseBrowser
    .from('products')
    .select('*')
    .in('status', ['open', 'closed', 'ended'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function getPublicProduct(productId: string): Promise<ProductRow> {
  const { data, error } = await supabaseBrowser
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return data as ProductRow;
}
