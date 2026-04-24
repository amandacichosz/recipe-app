import { Component, ElementRef, Inject, inject } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import {MatButtonModule} from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './add-edit-recipe.component.html',
  styleUrl: './add-edit-recipe.component.scss'
})
export class AddEditRecipeComponent {

  public form!: UntypedFormGroup;
  public tagsOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Appetizer', 'Other'];
  public title!: string;

  private fb = inject(FormBuilder)
  private elementRef = inject(ElementRef<HTMLElement>);

  // readonly dialogRef = inject(MatDialogRef<AddEditRecipeComponent>);
  constructor(
    public dialogRef: DialogRef<AddEditRecipeComponent>,
    @Inject(DIALOG_DATA) public data: any
  ) {}

  public get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  public get directions(): FormArray {
    return this.form.get('directions') as FormArray;
  }

  public onCancel(): void {
    console.log('Closing dialog', this.dialogRef, this.data);
    this.dialogRef.close();
  }

  public onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => this.focusFirstInvalidControl());
      return;
    }

    const ingredientValues = this.ingredients.controls
      .map((control) => `${control.value ?? ''}`.trim())
      .filter(Boolean);
    const directionValues = this.directions.controls
      .map((control) => `${control.value ?? ''}`.trim())
      .filter(Boolean);

    console.log('Saving recipe', {
      ...this.form.value,
      ingredients: ingredientValues,
      directions: directionValues
    });
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      ingredients: this.fb.array([this.createIngredientControl()]),
      directions: this.fb.array([this.createDirectionControl()]),
      tags: [[]]
    });
  }

  public onIngredientInput(index: number): void {
    const control = this.ingredients.at(index);
    const value = `${control.value ?? ''}`.trim();
    const isLastRow = index === this.ingredients.length - 1;

    if (isLastRow && value) {
      this.ingredients.push(this.createIngredientControl());
    }

    this.ensureSingleEmptyIngredientRow();
  }

  public removeIngredient(index: number): void {
    if (this.ingredients.length === 1) {
      this.ingredients.at(0).setValue('');
      return;
    }

    this.ingredients.removeAt(index);
    this.ensureSingleEmptyIngredientRow();
  }

  public shouldShowRemoveIngredient(index: number): boolean {
    const value = `${this.ingredients.at(index)?.value ?? ''}`.trim();
    return !!value;
  }

  public onDirectionInput(index: number): void {
    const control = this.directions.at(index);
    const value = `${control.value ?? ''}`.trim();
    const isLastRow = index === this.directions.length - 1;

    if (isLastRow && value) {
      this.directions.push(this.createDirectionControl());
    }

    this.ensureSingleEmptyDirectionRow();
  }

  public removeDirection(index: number): void {
    if (this.directions.length === 1) {
      this.directions.at(0).setValue('');
      return;
    }

    this.directions.removeAt(index);
    this.ensureSingleEmptyDirectionRow();
  }

  public shouldShowRemoveDirection(index: number): boolean {
    const value = `${this.directions.at(index)?.value ?? ''}`.trim();
    return !!value;
  }

  private createIngredientControl() {
    return this.fb.control('');
  }

  private createDirectionControl() {
    return this.fb.control('');
  }

  private ensureSingleEmptyIngredientRow(): void {
    const controls = this.ingredients.controls;

    for (let index = controls.length - 2; index >= 0; index--) {
      const value = `${controls[index].value ?? ''}`.trim();
      const nextValue = `${controls[index + 1].value ?? ''}`.trim();

      if (!value && !nextValue) {
        this.ingredients.removeAt(index + 1);
      }
    }

    const lastValue = `${this.ingredients.at(this.ingredients.length - 1)?.value ?? ''}`.trim();
    if (lastValue) {
      this.ingredients.push(this.createIngredientControl());
    }
  }

  private ensureSingleEmptyDirectionRow(): void {
    const controls = this.directions.controls;

    for (let index = controls.length - 2; index >= 0; index--) {
      const value = `${controls[index].value ?? ''}`.trim();
      const nextValue = `${controls[index + 1].value ?? ''}`.trim();

      if (!value && !nextValue) {
        this.directions.removeAt(index + 1);
      }
    }

    const lastValue = `${this.directions.at(this.directions.length - 1)?.value ?? ''}`.trim();
    if (lastValue) {
      this.directions.push(this.createDirectionControl());
    }
  }

  private focusFirstInvalidControl(): void {
    const firstInvalidControl = this.elementRef.nativeElement.querySelector(
      '.ng-invalid[formControlName] input, .ng-invalid[formControlName] textarea, .ng-invalid[formControlName] .mat-mdc-select-trigger, input.ng-invalid, textarea.ng-invalid'
    ) as HTMLElement | null;

    firstInvalidControl?.focus();
  }

}
