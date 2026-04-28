import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Component, inject, Inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar } from '@angular/material/snack-bar'
import { RecipesService } from '../../core/recipes/recipes.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-delete-recipe',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './delete-recipe.component.html',
  styleUrls: ['./delete-recipe.component.scss']
})
export class DeleteRecipeComponent {

  private recipeService = inject(RecipesService)
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)

  constructor(
    public dialogRef: DialogRef<DeleteRecipeComponent>,
    @Inject(DIALOG_DATA) public data: any
  ) {}

  public onCancel(): void {
    this.dialogRef.close()
  }

  public onDelete(): void {
    this.recipeService.deleteRecipe(this.data.id).subscribe({
      next: () => {
        this.snackBar.open('Recipe deleted successfully')
        this.dialogRef.close()
        this.router.navigate(['/recipes'])
      },
      error: () => this.snackBar.open('Error deleting recipe')
    })
  }

}
