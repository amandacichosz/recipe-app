import { Component, ElementRef, EventEmitter, Inject, inject, Output } from '@angular/core'
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import {MatButtonModule} from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { MatIconModule } from '@angular/material/icon'
import { RecipesService } from '../../core/recipes/recipes.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './add-edit-recipe.component.html',
  styleUrl: './add-edit-recipe.component.scss'
})
export class AddEditRecipeComponent {

  public form!: UntypedFormGroup
  public tagsOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Appetizer', 'Other']
  public title!: string

  @Output() public saved = new EventEmitter<any>()
  private fb = inject(FormBuilder)
  private elementRef = inject(ElementRef<HTMLElement>)
  private recipeService = inject(RecipesService)


  constructor(
    public dialogRef: DialogRef<AddEditRecipeComponent>,
    @Inject(DIALOG_DATA) public data: any
  ) {}

  public get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray
  }

  public get directions(): FormArray {
    return this.form.get('directions') as FormArray
  }

  public onCancel(): void {
    this.dialogRef.close()
  }

  public onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      queueMicrotask(() => this.focusFirstInvalidControl())
      return
    }

    const params = {
      ...this.form.value,
      ingredients: this.trimValues(this.ingredients),
      directions: this.trimValues(this.directions)
    }

    const response = this.data.id ? this.updateRecipe(this.data.id, params) : this.createRecipe(params)

    response.subscribe({
      next: (res) => {
        console.log('saved', res)
        this.saved.emit(params)
        this.dialogRef.close()
      },
      error: (error) => console.error('Error saving recipe', error)
    })
  }

  private trimValues(array: FormArray): any[] {
    return array.controls.map((c) => `${c.value ?? ''}`.trim()).filter(Boolean)
  }

  private createRecipe(params: any): Observable<any> {
    return this.recipeService.createRecipe(params)
  }

  private updateRecipe(id: string, params: any): Observable<any> {
    return this.recipeService.updateRecipe(id, params)
  }


  public ngOnInit(): void {
    const { ingredients, directions } = this.data || {}
    const ingredientControls = ingredients?.map((i: string) => this.createFormControl(i)) || []
    ingredientControls.push(this.createFormControl())
    const directionControls = directions?.map((d: string) => this.createFormControl(d)) || []
    directionControls.push(this.createFormControl())

    this.form = this.fb.group({
      name: [this.data.name || '', Validators.required],
      ingredients: this.fb.array([...ingredientControls]),
      directions: this.fb.array([...directionControls]),
      tags: [this.data.tags || []]
    })
    console.log(this.form)
  }

  public shouldRemoveControl(array: FormArray, index: number): boolean {
    const value = `${array.at(index)?.value ?? ''}`.trim()
    return !!value
  }

  public onInput(array: FormArray, index: number): void {
    const control = array.at(index)
    const value = `${control.value ?? ''}`.trim()
    const isLastRow = index === array.length - 1

    if (isLastRow && value) {
      array.push(this.createFormControl())
    }

    this.ensureSingleEmptyRow(array)
  }

  public removeControl(array: FormArray, index: number): void {
    if (array.length === 1) {
      array.at(0).setValue('')
      return
    }

    array.removeAt(index)
    this.ensureSingleEmptyRow(array)
  }

  private ensureSingleEmptyRow(array: FormArray): void {
    const controls = array.controls

    for (let index = controls.length - 2; index >= 0; index--) {
      const value = `${controls[index].value ?? ''}`.trim()
      const nextValue = `${controls[index + 1].value ?? ''}`.trim()

      if (!value && !nextValue) {
        array.removeAt(index + 1)
      }
    }

    const lastValue = `${array.at(array.length - 1)?.value ?? ''}`.trim()
    if (lastValue) {
      array.push(this.createFormControl())
    }
  }

  private createFormControl(value = '') {
    return this.fb.control(value)
  }

  private focusFirstInvalidControl(): void {
    const firstInvalidControl = this.elementRef.nativeElement.querySelector(
      '.ng-invalid[formControlName] input, .ng-invalid[formControlName] textarea, .ng-invalid[formControlName] .mat-mdc-select-trigger, input.ng-invalid, textarea.ng-invalid'
    ) as HTMLElement | null

    firstInvalidControl?.focus()
  }

}
