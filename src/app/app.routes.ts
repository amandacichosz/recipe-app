import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component'

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'recipes', loadComponent: () => import('./features/recipes/recipes.component').then(m => m.RecipesComponent) },
  { path: 'recipe/:id', loadComponent: () => import('./features/recipe/recipe.component').then(m => m.RecipeComponent) },
  { path: '', redirectTo: 'recipes', pathMatch: 'full' }
];
