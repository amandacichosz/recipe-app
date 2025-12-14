import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { FormBuilder, UntypedFormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule, FormArray } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged'
import { combineLatest, debounceTime, Observable, startWith, Subject, switchMap, take, takeUntil } from 'rxjs'
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { Router } from '@angular/router'

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatChipsModule, MatListModule, ɵInternalFormsSharedModule, TitleCasePipe, SpinnerComponent],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent {

  public recipes$!: Observable<any>;

  public form: UntypedFormGroup = new UntypedFormGroup({});
  public loading = true;
  public spinnerTimeout = setTimeout(() => this.loading = true, 150);
  public quickFilters = ['breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 'other' ];

  private fb = inject(FormBuilder);
  private recipesService = inject(RecipesService);
  private router = inject(Router);
  private destroyComponent$ = new Subject<void>();


  public ngOnInit(): void {
    this.createForm();
    this.initStream();
  }

  public initStream(): void {
    const query$ = this.form.get('query')?.valueChanges.pipe(
      startWith(this.form.get('query')?.value),
      debounceTime(300),
      distinctUntilChanged(),
    ) as Observable<string>;

    const tags$ = this.form.get('tags')?.valueChanges.pipe(
      startWith(this.form.get('tags')?.value),
      debounceTime(300),
      distinctUntilChanged((a, b) => this.deepCompare(a, b))
    ) as Observable<string[]>;

    this.recipes$ = combineLatest([query$, tags$]).pipe(
      takeUntil(this.destroyComponent$),
      switchMap(([searchTerm, tags]) => this.getRecipies(searchTerm, tags)),
    );
  }

  public ngOnDestroy(): void {
    this.destroyComponent$.next();
    this.destroyComponent$.complete();
  }

  public viewRecipe(id: string): void {
    console.log('View recipe', id);
    this.router.navigate(['/recipe', id]);
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


  private getRecipies(search?: string, tags?: string[]): Observable<any> {
    const searchTerm = search ? search : this.form.get('search')?.value;
    const filteredTags = tags && tags.length > 0 ? tags : this.form.get('tags')?.value;
    console.log('Fetching recipes with', { searchTerm, filteredTags });
    return this.recipesService.getRecipes(searchTerm, filteredTags);
  }

  private createForm(): void {
    this.form = this.fb.group({
      query: [''],
      tags: [[]]
    });
  }

  private deepCompare(a: any, b: any): boolean {
    return a.length === b.length && [...a].sort().every((v, i ) => v === [...b].sort()[i]);
  }

}
