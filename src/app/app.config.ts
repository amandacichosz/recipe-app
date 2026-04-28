import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'

import { routes } from './app.routes'
import { provideHttpClient } from '@angular/common/http'
import { environment } from '../environments/environment'
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'
import { provideFirestore, getFirestore } from '@angular/fire/firestore'
import { getAuth, provideAuth } from '@angular/fire/auth'
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // Angular Material Overrides
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: 'always', appearance: 'outline' }
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 } as MatSnackBarConfig
    }

  ]
}

