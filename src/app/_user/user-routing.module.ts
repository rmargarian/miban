import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserComponent } from '@app/_user/user.component';
import { RegisterPageComponent } from '@app/_user/pages/register-page/register-page.component';
import { EnterKeyComponent } from '@app/_user/pages/enter-key/enter-key.component';
import { ChoosePFAComponent } from '@app/_user/pages/choose-pfa/choose-pfa.component';
import { EnterEmailComponent } from '@app/_user/pages/enter-email/enter-email.component';
import { ChangeKeyPageComponent } from '@app/_user/pages/change-key-page/change-key-page.component';
import { StartAttemptComponent } from '@app/_user/pages/start-attempt/start-attempt.component';
import { StartFreeAttemptComponent } from '@app/_user/pages/start-free-attempt/start-free-attempt.component';
import { ResultsPageComponent } from '@app/_user/pages/results-page/results-page.component';

import { UserRoutesEnum } from '@app/_user/enums';

const routes: Routes = [
  {
    path: '', component: UserComponent, pathMatch: 'prefix',
    children: [
      {path: '', component: EnterKeyComponent},

      {path: UserRoutesEnum.CHOOSE_PFA + '/:dashed', component: ChoosePFAComponent},

      {path: UserRoutesEnum.ENTER_EMAIL + '/:dashed', component: EnterEmailComponent},

      {path: UserRoutesEnum.CHANGE_KEY + '/:dashed', component: ChangeKeyPageComponent},

      {path: UserRoutesEnum.REGISTER + '/:dashed', component: RegisterPageComponent},
      {path: UserRoutesEnum.AUTHENTICATE + '/:dashed', component: RegisterPageComponent},

      {path: UserRoutesEnum.START + '/:dashed', component: StartAttemptComponent},

      {path: UserRoutesEnum.PRICE_INCREASE, component: StartFreeAttemptComponent},

      {path: UserRoutesEnum.RESULT + '/:dashed', component: ResultsPageComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
