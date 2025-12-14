import { Component, inject } from '@angular/core';
import { RecipesService } from '../../core/recipes/recipes.service'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged'
import { combineLatest, debounceTime, Observable, of, startWith, Subject, switchMap, takeUntil } from 'rxjs'
import { SpinnerComponent } from '../../shared/spinner/spinner.component'
import { Router } from '@angular/router'

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatChipsModule, TitleCasePipe, SpinnerComponent],
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
    return this.recipesService.getRecipes(searchTerm, filteredTags);
    // return of([
    //   {
    //       "tags": [
    //           "other"
    //       ],
    //       "ingredients": [
    //           "1 pk 14oz coleslaw mix",
    //           "3/4 C mayo",
    //           "1/3 C sour cream",
    //           "3/4 t season salt",
    //           "1/2 t ground mustard",
    //           "1/4 t celery salt",
    //           "1/8 - 1/4 C sugar"
    //       ],
    //       "directions": [
    //           "combine together in a bowl"
    //       ],
    //       "name": "coleslaw",
    //       "id": "EjyF5jp1TiGZDBlb8meT"
    //   },
    //   {
    //       "ingredients": [
    //           "1/4 cup red curry paste, store-bought or make your own!",
    //           "1 can coconut milk (13.5 oz) full fat is best",
    //           "1 –2 tablespoons brown sugar (adjust as needed) or sub coconut sugar, honey, or alternative sugar",
    //           "1–2 tablespoons fish sauce (and adjust as needed) or vegan fish sauce",
    //           "1 lb chicken, cut into thin, bite-sized slices (or make crispy tofu, or use shrimp)",
    //           "1/4 cup water or broth",
    //           "1 cup fresh pineapple, cut into bite-sized pieces- or use frozen, or canned (drained & rinsed)",
    //           "1 cup tomatoes, cut into bite-sized pieces",
    //           "1/2 cup zucchini, cut into bite-sized pieces ( or sub snow peas, green beans or asparagus)",
    //           "1/2 cup red bell peppers, diced",
    //           "1/2 cup Thai basil (or sub regular basil)",
    //           "A squeeze of Lime to taste",
    //           "optional: 5-6 Kaffir lime leaves (add to the simmering sauce)"
    //       ],
    //       "name": "thai pineapple curry",
    //       "directions": [
    //           "Add curry paste and 3/4 of can the coconut milk to a medium pot over high heat and stir together creamy sauce forms. About 1-2 minutes or watch for bubbles on the sauce.",
    //           "Add sugar and fish sauce, stir, and simmer for 1 minute.",
    //           "Add the chicken, water, and cook for 4-5 more minutes until the chicken is tender. If using tofu, shrimp, or vegetables, cook for only 2-3 minutes.",
    //           "Add pineapple, tomatoes, and the vegetables, cover, and cook until slightly soft, 2-3 minutes.",
    //           "Add the rest of the coconut milk and adjust the flavors with more fish sauce, salt, sugar, and extra curry paste to find your perfect balance. Add a squeeze of lime if you like.  Keep in mind, that serving it over rice will mellow the flavor considerably.",
    //           "Turn off the heat, add the Thai basil, and stir in one last time. Let cool slightly and serve over jasmine rice and top with more fresh basil and enjoy!"
    //       ],
    //       "tags": [
    //           "dinner"
    //       ],
    //       "id": "dz3R7rOr8ZDHkcBcl9AP"
    //   }
    // ]);
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
