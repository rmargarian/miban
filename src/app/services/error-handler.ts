import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export function handleError(error: HttpErrorResponse) {
  let err = 'Something bad happened; please try again later.';
  if (error && error.error && error.error.message) {
    console.error(error.error.message);
    err = error.error.message;
  } else if (error && error.message) {
    console.error(JSON.stringify(error.message));
    err = JSON.stringify(error.message);
  } else if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    console.error('An error occurred:', error.error.message);
    err = 'An error occurred:' + error.error.message;
  } else if (error.error instanceof Object) {
    console.error(JSON.stringify(error.error));
    err = JSON.stringify(error.error);
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
    err = `Backend returned code ${error.status}, ` +
    `body was: ${error.error}`;
  }
  // return an observable with a user-facing error message
  return throwError(err);
}
