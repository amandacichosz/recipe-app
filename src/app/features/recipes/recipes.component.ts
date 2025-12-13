import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { FormBuilder, UntypedFormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule, FormArray } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged'
import { debounceTime, Observable, Subject, switchMap, take, takeUntil } from 'rxjs'
import { SpinnerComponent } from '../../shared/spinner/spinner.component'

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatChipsModule, MatListModule, ɵInternalFormsSharedModule, TitleCasePipe, SpinnerComponent],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent {
  public recipes: any

  public form: UntypedFormGroup = new UntypedFormGroup({});
  public loading = true;
  public spinnerTimeout = setTimeout(() => this.loading = true, 150);
  public quickFilters = ['breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 'other' ];

  private fb = inject(FormBuilder);
  private recipesService = inject(RecipesService);
  private destroyComponent$ = new Subject<void>();

  public ngOnInit(): void {
    this.createForm();
    this.initQueryStream();
    //this.initFilterStream();
    this.recipesService.getRecipes().subscribe((recipes) => {
      clearTimeout(this.spinnerTimeout);
      this.recipes = recipes;
      this.loading = false;
    });
  }

  public ngOnDestroy(): void {
    this.destroyComponent$.next();
    this.destroyComponent$.complete();
  }

  public quickFilterChange(event: any, tag: string): void {
    const currentTags = this.form.get('tags')?.value as string[];
    if (currentTags.includes(tag)) {
      this.form.get('tags')?.setValue(currentTags.filter(t => t !== tag));
      this.removeActiveClass(event.target);
    } else {
      const newTags = [...currentTags, tag];
      this.form.get('tags')?.setValue(newTags);
      this.addActiveClass(event.target);
    }
  }

  private addActiveClass(el: HTMLElement): void {
    el.classList.add('active');
  }

  private removeActiveClass(el: HTMLElement): void {
    el.classList.remove('active');
  }

  private initQueryStream(): void {
    this.form.get('query')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyComponent$),
      switchMap((searchTerm: string) => this.getRecipies(searchTerm, this.getTags())),
    ).subscribe((recipes) => {
      clearTimeout(this.spinnerTimeout);
      this.recipes = recipes;
      this.loading = false;
    });
  }

  private initFilterStream(): void {
    this.form.get('tags')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyComponent$),
      switchMap((tags: string[]) => this.getRecipies(this.getQuery(), tags)),
    ).subscribe((recipes) => {
      clearTimeout(this.spinnerTimeout);
      this.recipes = recipes;
      this.loading = false;
    });
  }


  private getRecipies(search?: string, tags?: string[]): Observable<any> {
    this.spinnerTimeout
    const searchTerm = search ? search : this.form.get('search')?.value;
    const filteredTags = tags && tags.length > 0 ? tags : this.form.get('tags')?.value;

    return this.recipesService.getRecipes(searchTerm, filteredTags);
  }

  private getTags(): string[] {
    return this.form.get('tags')?.value || [];
  }

  private getQuery(): string {
    return this.form.get('query')?.value || '';
  }


  private createForm(): void {
    this.form = this.fb.group({
      query: [''],
      tags: [[]]
    });
  }

}
