import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { AddEditRecipeComponent } from '../add-edit-recipe/add-edit-recipe.component'
import { Dialog } from '@angular/cdk/dialog'

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatDividerModule, SpinnerComponent],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.scss'
})
export class RecipeComponent {

  // TODO back button to recipes list
  public recipe$!: Observable<any>;
  private recipeService = inject(RecipesService);
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);

  public ngOnInit(): void {
    console.log('RecipeComponent initialized');
    const recipeId = this.route.snapshot.paramMap.get('id');
    console.log('Recipe ID from route:', recipeId);
    this.recipe$ = this.recipeService.getRecipeById(recipeId!);

    // Fetch the recipe details using the recipeId
    // this.recipeService.getRecipeById('some-id').subscribe(recipe => {
    //   console.log('Fetched recipe:', recipe);
    // });
  }

  public editRecipe(): void {
    console.log('Edit recipe clicked');
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    const ref = this.dialog.open(AddEditRecipeComponent, {
      data: { title: 'Edit Recipe' },
      width: isMobile ? '100vw' : '92vw',
      height: isMobile ? '100dvh' : '88vh',
      maxWidth: isMobile ? '100vw' : '1100px',
      maxHeight: isMobile ? '100dvh' : '900px',
    });
    console.log('ref', ref)

    // Navigate to the edit recipe page
    // ref.closed.subscribe(result => {
    //   console.log('Dialog closed with result:', result);
    //   ref.close();
    // });


  }

}
