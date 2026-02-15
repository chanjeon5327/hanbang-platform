export type DividendRow = {
  id: string;
  item_id: string;
  total_revenue: number;
  dividend_rate: number;
  total_dividend_amount: number;
  created_at: string;
  status?: string;
  confirmed_at?: string | null;
};

export type DividendDistributionRow = {
  id?: string;
  dividend_id: string;
  user_id: string;
  share_quantity: number;
  payout_amount: number;
  created_at: string;
};

export type DividendDetail = DividendRow & {
  total_payout?: number;
  recipient_count?: number;
};
