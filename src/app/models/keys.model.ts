export interface Keys {
  assessments: any[];
  feedbacks: any[];
  profiles: any[];
  questionnaires: any;
  id: number;
  title: string;
  date_create: Date;
  lastActivity: any;
  company_key: string;
  type: number;
  sponsor_name: string;
  email: string;
  industry_sector: string;
  job_title: string;
  manager_name: string;
  department: string;
  c_category: number;
  training_date: string;
  training_course_id: number;
  country_id: number;
  state_name: string;
  city: string;
  currency_id: number;
  fe_currency_id: number;
  exam_id: number;
  show_industry_sector: number;
  show_job_title: number;
  show_manager_name: number;
  show_dept: number;
  show_career_category: number;
  show_training_date: number;
  show_training_cource: number;
  show_country: number;
  show_state: number;
  show_city: number;
  edit_industry_sector: number;
  edit_job_title: number;
  edit_manager_name: number;
  edit_dept: number;
  edit_career_category: number;
  edit_training_cource: number;
  edit_country: number;
  edit_state: number;
  edit_city: number;
  mn_city: number;
  mn_state: number;
  mn_country: number;
  mn_training_cource: number;
  mn_training_date: number;
  mn_career_category: number;
  mn_dept: number;
  mn_job_title: number;
  mn_manager_name: number;
  mn_industry_sector: number;
  is_set_training_date: number;
  is_set_training_day: number;
  reports_pass: string;
  not_activated: boolean;
  value: string; //title + company_key
}