import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { LoadingModule } from 'ngx-loading';
import { RouterModule } from '@angular/router';
import { SortablejsModule } from 'angular-sortablejs';
import { DragulaModule } from 'ng2-dragula';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import {
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatSortModule,
  MatDialogModule,
  MatTooltipModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatSliderModule,
} from '@angular/material';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import {SingleColumnGridComponent} from '@app/pages/questionnaire-item-page/single-column-grid/single-column-grid.component';
import {SelectDialogComponent} from '@app/components/dialog/select-dialog/select-dialog.component';

import { DialogDraggableTitleDirective } from '@app/directives/dialog-draggable-title.directive';

import { AdminToolbarComponent } from '@app/components/admin-toolbar/admin-toolbar.component';
import { ButtonComponent } from '@app/components/button/button.component';
import { IconButtonComponent } from '@app/components/button/icon-button/icon-button.component';
import { TextButtonComponent } from '@app/components/button/text-button/text-button.component';
import { SearchInputComponent } from '@app/components/inputs/search-input/search-input.component';
import { DialogComponent } from '@app/components/dialog/dialog.component';
import { InputComponent } from '@app/components/inputs/input.component';
import { FormInputComponent } from '@app/components/form-input/form-input.component';
import { SelectInputComponent } from '@app/components/inputs/select-input/select-input.component';
import { DatePickerComponent } from '@app/components/inputs/date-picker/date-picker.component';
import { TextareaComponent } from '@app/components/inputs/textarea/textarea.component';
import { PasswordInputComponent } from '@app/components/inputs/password-input/password.input.component';
import { AdminDialogComponent } from '@app/pages/user-administration/admin-dialog/admin-dialog.component';
import { ConfirmationDialogComponent } from '@app/components/dialog/confirmation-dialog/confirmation-dialog.component';
import { WarningDialogComponent } from '@app/components/dialog/warning-dialog/warning-dialog.component';
import { InformationDialogComponent } from '@app/components/dialog/information-dialog/information-dialog.component';
import { StrengthPasswordComponent } from '@app/components/inputs/strength-password/strength-password.component';
import { RadioButtonsGroupComponent } from '@app/components/inputs/radio-buttons-group/radio-buttons-group.component';
import { FileInputComponent } from '@app/components/inputs/file-input/file-input.component';
import { PhoneInputComponent } from '@app/components/inputs/phone-input/phone-input.component';
import { ExtendDialogComponent } from '@app/components/dialog/extend-dialog/extend-dialog.component';

import {
  AnswerInputBaseComponent,
  TextAnswerInputComponent,
  AnswerWrapperComponent,
  ArrayAnswerInputComponent,
  NumericAnswerInputComponent,
  MultiChoicesMultiOptionsComponent,
  MultiChoicesSingleOptionComponent,
  AnswerInputWithOptionsBaseComponent,
  SliderAnswerInputComponent,
  OrderAnswerComponent
} from '@app/components/answer-input-base';

import { ConfigurationBlockComponent } from '@app/components/configuration-block/configuration-block.component';
import { RadioButtonComponent } from '@app/components/inputs/radio-button/radio-button.component';
import { OptionsEditorComponent } from '@app/components/options-editor/options-editor.component';
import { OptionsMultiChoiceEditorComponent } from '@app/components/options-multichoice-editor/options-multichoice-editor.component';
import { SliderComponent } from '@app/components/inputs/slider/slider.component';

import {TextAnswerComponent} from '@app/_reports/components/graphs/text-answer/text-answer.component';

import {
  AttemptService
} from '@app/_user/services';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatSliderModule,
    RecaptchaV3Module,
    NgSelectModule,
    NgOptionHighlightModule,
    DragulaModule.forRoot(),
    LoadingModule,
    RouterModule,
    SortablejsModule.forRoot({animation: 150}),
    AgGridModule.withComponents([]),
    FontAwesomeModule
  ],
  declarations: [
    ButtonComponent,
    AdminToolbarComponent,
    IconButtonComponent,
    TextButtonComponent,
    SearchInputComponent,
    AdminDialogComponent,
    DialogComponent,
    InputComponent,
    FormInputComponent,
    SelectInputComponent,
    ConfirmationDialogComponent,
    WarningDialogComponent,
    InformationDialogComponent,
    DatePickerComponent,
    TextareaComponent,
    PasswordInputComponent,
    ConfigurationBlockComponent,
    RadioButtonComponent,
    RadioButtonsGroupComponent,
    FileInputComponent,
    PhoneInputComponent,
    ExtendDialogComponent,
    DialogDraggableTitleDirective,
    StrengthPasswordComponent,
    TextAnswerComponent,
    OptionsEditorComponent,
    OptionsMultiChoiceEditorComponent,
    AnswerInputBaseComponent,
    TextAnswerInputComponent,
    AnswerWrapperComponent,
    ArrayAnswerInputComponent,
    NumericAnswerInputComponent,
    MultiChoicesMultiOptionsComponent,
    MultiChoicesSingleOptionComponent,
    AnswerInputWithOptionsBaseComponent,
    SliderAnswerInputComponent,
    OrderAnswerComponent,
    SliderComponent,
    SingleColumnGridComponent,
    SelectDialogComponent
  ],
  providers: [
    DatePipe,
    Title,
    AttemptService,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Ld56bUUAAAAAJFiR6bOkNd5K9VpTPGXNCHQRF-s' }
  ],
  entryComponents: [
    AdminDialogComponent,
    ConfirmationDialogComponent,
    WarningDialogComponent,
    InformationDialogComponent,
    StrengthPasswordComponent,
    SelectDialogComponent,
    ExtendDialogComponent
  ],
  exports: [
    /**imports */
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatTabsModule,
    NgSelectModule,
    NgOptionHighlightModule,
    RecaptchaV3Module,
    LoadingModule,
    RouterModule,
    FontAwesomeModule,
    AngularFontAwesomeModule,

    /**declarations */
    ButtonComponent,
    AdminToolbarComponent,
    IconButtonComponent,
    TextButtonComponent,
    SearchInputComponent,
    AdminDialogComponent,
    DialogComponent,
    InputComponent,
    FormInputComponent,
    SelectInputComponent,
    ConfirmationDialogComponent,
    WarningDialogComponent,
    DatePickerComponent,
    InformationDialogComponent,
    DatePickerComponent,
    TextareaComponent,
    PasswordInputComponent,
    ConfigurationBlockComponent,
    RadioButtonComponent,
    DialogDraggableTitleDirective,
    StrengthPasswordComponent,
    OptionsEditorComponent,
    OptionsMultiChoiceEditorComponent,
    AnswerInputBaseComponent,
    TextAnswerInputComponent,
    AnswerWrapperComponent,
    ArrayAnswerInputComponent,
    NumericAnswerInputComponent,
    MultiChoicesMultiOptionsComponent,
    MultiChoicesSingleOptionComponent,
    AnswerInputWithOptionsBaseComponent,
    SliderAnswerInputComponent,
    OrderAnswerComponent,
    RadioButtonsGroupComponent,
    FileInputComponent,
    PhoneInputComponent,
    ExtendDialogComponent,
    SliderComponent,
    TextAnswerComponent,
    SingleColumnGridComponent,
    SelectDialogComponent,

    /**providers */
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SharedModule {
  constructor(library: FaIconLibrary) {
       library.addIconPacks(fas, far, fab);
  }
}
