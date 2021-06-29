export interface Admin {
  id: number;
  email: string;
  name: string;
  last_access: string;
  last_access_formatted: string;
  default_currency: string;
  username: string;
  is_super: boolean;
}
