import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { AddEditRecipeComponent } from '../add-edit-recipe/add-edit-recipe.component'
import { Dialog } from '@angular/cdk/dialog'

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, SpinnerComponent],
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
    const recipeId = this.route.snapshot.paramMap.get('id')
    this.recipe$ = this.recipeService.getRecipeById(recipeId!)

    // Fetch the recipe details using the recipeId
    // this.recipeService.getRecipeById('some-id').subscribe(recipe => {
    //   console.log('Fetched recipe:', recipe);
    // });
  }

  public async editRecipe(): Promise<void> {
    const recipe = await firstValueFrom(this.recipe$);
    console.log(recipe)
    const ref = this.dialog.open(AddEditRecipeComponent, {
      data: {
        title: 'Edit Recipe',
        id: recipe.id,
        ...recipe
      }
    });
    console.log('ref', ref)
    if (ref?.componentInstance) {
      ref.componentInstance.saved.subscribe((recipe) => {
        console.log('Recipe saved:', recipe)
        this.recipe$ = of(recipe)
      });
    }

  }

  public deleteRecipe(): void {
    console.log('Delete recipe clicked');
  }

}

