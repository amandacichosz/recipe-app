import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './add-recipe.component.html',
  styleUrl: './add-recipe.component.scss'
})
export class AddRecipeComponent {

  public form!: UntypedFormGroup;
  public tagsOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Appetizer', 'Other'];
  private fb = inject(FormBuilder)

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      ingredients: [[]],
      directions: [[]],
      tags: [[]]
    });
  }

}
