import { UserAnswer, QuestionAnswerOption, SliderTag } from '@app/models';
/**
 * Model contains all fields from 'questions' DB table
 * + QuestionQroupQuestionMap array ('question_groups_questions_maps' DB table)
 * + QuestionAnswerOption array ('question_answer_options' DB table)
 * + SliderTag array ('sliders_tags' DB table)
 * + UserAnswer array ('user_answers' DB table)
 * + hidden and selected fields
 */
export interface Question {
  id: number;
  label_set_id: number;
  type: number;
  quest_type: number;
  title: string;
  question_code: string;
  help: string;
  more_info: string;
  is_commented: number;
  order_pos: number;
  is_active: number;
  is_bonus: number;
  is_cloud: number;
  is_sort_hide: number;
  is_faces: number;
  is_mandatory: number;
  is_vertical_alig: number;
  item_numbers: number;
  comment_row: number;
  comment_label: string;
  explanation: string;
  is_comment_label: number;
  min_selected_options: number;
  max_selected_options: number;
  switch_type_graph: number;
  question_graph_type: number;
  slider_mode: number;
  range_interval: number;
  range_from_tag: string;
  range_from_value: number;
  range_to_tag: string;
  range_to_value: number;
  range_percentages: number;
  show_labels: number;
  show_tooltips: number;
  question_groups_questions_map: any[];
  question_answer_options: QuestionAnswerOption[];
  sliderTags: SliderTag[];
  deleted: boolean;
  selected: boolean;
  answers: UserAnswer[];
  hidden: boolean;
  alowDrop: boolean;
}
