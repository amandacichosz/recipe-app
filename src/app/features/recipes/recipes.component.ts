import { Component, inject, viewChild } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged'
import { combineLatest, debounceTime, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs'
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { Router } from '@angular/router'
import { Dialog } from '@angular/cdk/dialog'
import { AddEditRecipeComponent } from '../add-edit-recipe/add-edit-recipe.component'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    TitleCasePipe,
    SpinnerComponent
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent {

  public recipes$!: Observable<any>;

  public form: UntypedFormGroup = new UntypedFormGroup({});
  public loading = true;
  public spinnerTimeout = setTimeout(() => this.loading = true, 150);

  private fb = inject(FormBuilder);
  private recipesService = inject(RecipesService);
  private router = inject(Router);
  private destroyComponent$ = new Subject<void>();
  private dialog = inject(Dialog);
  private appliedFilters$ = new BehaviorSubject<string[]>([]);
  private filterMenuTrigger = viewChild(MatMenuTrigger);

  public get selectedFilterCount(): number {
    return this.getSelectedFilters(this.form.get('filters')?.value).length;
  }


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

    this.recipes$ = combineLatest([query$, this.appliedFilters$]).pipe(
      takeUntil(this.destroyComponent$),
      switchMap(([searchTerm, filters]) => this.getRecipes(searchTerm, filters)),
    );
  }

  public ngOnDestroy(): void {
    this.destroyComponent$.next();
    this.destroyComponent$.complete();
    this.appliedFilters$.complete();
  }

  public viewRecipe(id: string): void {
    console.log('View recipe', id);
    this.router.navigate(['/recipe', id]);
  }

  public reset(): void {
    this.form.patchValue({
      filters: {
        breakfast: false,
        lunch: false,
        dinner: false,
        dessert: false,
        other: false
      }
    });
  }

  public apply(): void {
    const selectedFilters = this.getSelectedFilters(this.form.get('filters')?.value);
    this.appliedFilters$.next(selectedFilters);
    this.closeFilterMenu();
  }

  public closeFilterMenu(): void {
    this.filterMenuTrigger()?.closeMenu();
  }

  public addRecipe(): void {
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    const ref = this.dialog.open(AddEditRecipeComponent, {
      data: { title: 'Add Recipe' },

    });
  }

  private getRecipes(search?: string, tags?: string[]): Observable<any> {
    const searchTerm = search?.trim() || undefined;
    const selectedTags = tags?.length ? tags : undefined;
    return this.recipesService.getRecipes(searchTerm, selectedTags);
  }

  private createForm(): void {
    this.form = this.fb.group({
      query: [''],
      filters: this.fb.group({
        breakfast: [false],
        lunch: [false],
        dinner: [false],
        dessert: [false],
        other: [false]
      })
    });
  }

  private getSelectedFilters(filters: Record<string, boolean>): string[] {
    return Object.entries(filters ?? {})
      .filter(([, enabled]) => enabled)
      .map(([filterName]) => filterName);
  }

  private deepCompare(a: string[], b: string[]): boolean {
    return a.length === b.length && [...a].sort().every((v, i ) => v === [...b].sort()[i]);
  }

}
