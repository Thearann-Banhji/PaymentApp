export const INSTITUTE_ID = 'inst-28378586';

export type Invoice = {
  id: string;
  code: string;
  reference: string;
  date: string;
  amountInRiel: number;
};

export const invoices: Invoice[] = [
  { id: 'demo-1', code: '00000001', reference: 'INV-2026-001', date: '2026-10-21', amountInRiel: 125000 },
  { id: 'demo-2', code: '00000002', reference: 'INV-2026-002', date: '2026-10-22', amountInRiel: 86500 },
];

export const customer = {
  id: 'cus-c5e64f10-bc2d-11ef-a881-bbc93f913b17',
  name: 'Sokha Customer',
  phone: '+855 12 345 678',
  contract: 'CON-2026-001',
};
