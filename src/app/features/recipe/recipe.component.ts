import { Component, inject } from '@angular/core'
import { RecipesService } from '../../core/recipes/recipes.service'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { firstValueFrom, Observable, of } from 'rxjs'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { AddEditRecipeComponent } from '../add-edit-recipe/add-edit-recipe.component'
import { Dialog } from '@angular/cdk/dialog'
import { DeleteRecipeComponent } from '../delete-recipe/delete-recipe.component'
import { SlashWrapPipe } from '../../shared/pipes/slash-wrap.pipe'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    SpinnerComponent,
    SlashWrapPipe,
  ],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.scss'
})
export class RecipeComponent {

  public recipe$!: Observable<any>
  public menu = [
    {
      label: 'Share',
      icon: 'share',
      action: async () => this.shareRecipe()
    }
  ]

  public authMenuItems = [
    {
      label: 'Edit',
      icon: 'edit',
      action: async () => this.editRecipe()
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: async () => this.deleteRecipe()
    }
  ]

  private authService = inject(AuthService);
  private recipeService = inject(RecipesService);
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);

  public ngOnInit(): void {
    const recipeId = this.route.snapshot.paramMap.get('id')
    this.recipe$ = this.recipeService.getRecipeById(recipeId!)
    this.buildMenu()
  }

  public buildMenu(): void {
    const isLoggedIn = this.authService.isLoggedIn
    if (isLoggedIn) {
      this.menu = [...this.menu, ...this.authMenuItems]
    }
  }
  public async editRecipe(): Promise<void> {
    const recipe = await firstValueFrom(this.recipe$);
    const ref = this.dialog.open(AddEditRecipeComponent, {
      data: {
        title: 'Edit Recipe',
        id: recipe.id,
        ...recipe
      }
    })
    if (ref?.componentInstance) {
      ref.componentInstance.saved.subscribe((recipe) => {
        this.recipe$ = of(recipe)
      })
    }

  }

  public async deleteRecipe(): Promise<void> {
    const recipe = await firstValueFrom(this.recipe$)
    this.dialog.open(DeleteRecipeComponent, {
      data: {
        name: recipe.name,
        id: recipe.id,
      }
    })
  }

  private async shareRecipe(): Promise<void> {
    const recipe = await firstValueFrom(this.recipe$)
    const shareData = {
      title: recipe.title,
      url: window.location.href
    }
    navigator.share(shareData)
  }

}

