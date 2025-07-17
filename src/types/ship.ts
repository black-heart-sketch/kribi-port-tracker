export interface Ship {
  _id: string;
  name: string;
  imoNumber?: string;
  mmsiNumber?: string;
  flag?: string;
  type?: string;
  company?: string;
  photo?: string;
  length?: number;
  beam?: number;
  draft?: number;
  grossTonnage?: number;
  netTonnage?: number;
  yearBuilt?: number;
  owner?: string;
  createdBy?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string | Date;
  updatedAt: string | Date;
  __v?: number;
}
