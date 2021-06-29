import { Attempt, Currency, CareerCategory, Country, Keys } from '@app/models';

/**
 * Model contains all fields from 'users' DB table
 * + Attempt array ('attempts' DB table)
 * + Currency object ('currencies' DB table)
 * + CareerCategory object ('career_categories' DB table)
 * + Country object ('countries' DB table)
 * + Keys object ('companies' DB table)
 */

export interface User {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  passwd: string;
  career_category_id: number;
  job_title: string;
  department: string;
  manager_name: string;
  industry_sector: string;
  training_course_id: number;
  country_id: number;
  state_name: string;
  city: string;
  currency_id: number;
  notes: string;
  p_date: string;
  p_date2: string;
  p_location: string;
  p_groups: string;
  p_saved: string;
  last_attempt: Date;
  ip: string;
  last_location: string;
  organization: string;
  phone: string;
  phone_code: string;
  phone_iso2: string;
  isp: string;
  full_data: string;
  attempts: Attempt[];
  curr: Currency;
  career: CareerCategory;
  country: Country;
  company: Keys;
  isRepeated: boolean;
}
