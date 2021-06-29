export interface SendEmailTemplate {
  id: number;
  quest_id: number;
  email_type: string;
  email_subject: string;
  email_desc: string;
  tpl_content: string;
  important: number;
  createdAt: Date;
  updatedAt: Date;
}
