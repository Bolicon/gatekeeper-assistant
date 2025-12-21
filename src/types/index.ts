export interface Person {
  id: string;
  name: string;
  idNumber: string;
  role: string;
  vehicleNumber?: string;
  createdAt: Date;
}

export interface EntryLog {
  id: string;
  personId: string;
  personName: string;
  idNumber: string;
  role: string;
  vehicleNumber?: string;
  actionType: 'entry' | 'exit';
  timestamp: Date;
  note?: string;
}

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  personId?: string;
  personName?: string;
  idNumber?: string;
  vehicleNumber?: string;
  actionType?: 'entry' | 'exit' | 'all';
  searchQuery?: string;
}

export interface Stats {
  totalEntries: number;
  totalExits: number;
  uniqueVisitors: number;
  todayEntries: number;
  todayExits: number;
  currentlyInside: number;
}
