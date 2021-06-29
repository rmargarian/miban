import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validator, Validators } from '@angular/forms';
import { ConfigurationService, DataService } from '@app/services';
import { MatDialog, MatDialogRef } from '@angular/material';
import { InformationDialogComponent } from '@app/components';

interface Configs {
  id: number,
  name: string,
  value: string
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})

export class ConfigurationComponent {

  parentForm: FormGroup;
  passRemind: any[];
  changeKey: any[];
  configurationData: Configs[];
  passInfo: string;
  changeInfo : string;

  constructor(private fb: FormBuilder,
              public dialog: MatDialog,
              private dataService: DataService,
              private configurationService: ConfigurationService) {
  }

  ngOnInit() {
    this.passInfo = "{PASSWORD} User's password; {SPONSORNAME} Key's sponsor name; {FIRSTNAME} User's " +
      "first name; {LASTNAME} User's family name; {FULLNAME} User's first and family name; {RESULTS}" +
      " Participant's % score (in case of a completed Assessment); {PENAME} Profile/Assessment's Title; " +
      "{PEDESCRIP} Profile/Assessment's description; {EMAIL} User's email; {ADMINNAME} Key's admin name; " +
      "{ADMINEMAIL} Key's admin email; {PEURL} Profile/Assessment's url; {KEY} Company's key; {COMPLETED_LIST} " +
      "participants who completed Profile/Assessment; {CAREER_CATEGORY} User's career category; {JOBTITLE} User's " +
      "Job Title; {COUNTRY} User's country; {CITY} User's city";

    this.changeInfo = "{PASSWORD} User's password; {FIRSTNAME} User's " +
      "first name; {LASTNAME} User's family name; {EMAIL} User's email; {USER_LINK} User's link; {KEY} New company key" +
      "; {KEY_NAME} New company name; {KEY_OLD} Old company key; {KEY_NAME_OLD} Old company name; {DATE} Current date";
    this.buildForm();
    this.loadData();
  }

  private setFields(data: any[]) {
    this.passRemind = [
      {label: 'Subject:', fill: data[1].value, required: true, type: 'text', controlName: '2'},
      {label: 'Message:', fill: data[2].value, required: true, type: 'textarea', controlName: '3'},
    ];

    this.changeKey = [
      {label: 'Subject:', fill: data[7].value, required: true, type: 'text', controlName: '8'},
      {label: 'To Admin:', fill: data[5].value, required: true, type: 'text', controlName: '6'},
      {label: 'Message:', fill: data[6].value, required: true, type: 'textarea', controlName: '7'},
    ];

    this.parentForm.setValue({
      '2': data[1].value,
      '3': data[2].value,
      '8': data[7].value,
      '6': data[5].value,
      '7': data[6].value
    });
  }


  private loadData() {
    this.dataService.getAllConfigurations().subscribe((data) => {
      this.configurationData = data;
      this.setFields(this.configurationData);
    });
  }

  private buildForm() {
    this.parentForm = this.fb.group({
      '2': [, [Validators.required]],
      '3': [, [Validators.required]],
      '6': [, [Validators.required]],
      '7': [, [Validators.required]],
      '8': [, [Validators.required]]
    });
  }

  save() {
    if (this.parentForm.invalid) { return; }
    this.configurationService.update(this.parentForm.value).subscribe(data => {
      const dialogRef = this.openInformationDialog('Saved');
    });
  }


  private openInformationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      data: {
        title: 'Information',
        text: text
      }
    });
  }
}
