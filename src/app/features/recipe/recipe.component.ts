import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.scss'
})
export class RecipeComponent {

  // TODO back button to recipes list
  public recipe$!: Observable<any>;
  private recipeService = inject(RecipesService);
  private route = inject(ActivatedRoute);

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

}
