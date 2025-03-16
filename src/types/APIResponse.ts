export type APIResponse = {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
  error: string[];
  meta: Meta;
};

export type Meta = {
  page_number: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};
