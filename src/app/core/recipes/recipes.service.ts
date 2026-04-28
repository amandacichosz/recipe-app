import { Injectable, inject } from '@angular/core'
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  docData,
  doc,
  deleteDoc,
  Query,
  query,
  where,
  updateDoc,
} from '@angular/fire/firestore'
import { from, Observable, of, shareReplay, take, tap } from 'rxjs'

export interface Recipe {
  id: string
  name: string
  direction: string[]
  ingredients: string[]
  tags: string[]
  imageUrl: string
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private cache = new Map<string, Observable<Recipe[]>>()
  private entityCache = new Map<string, Recipe>()

  private firestore = inject(Firestore)


  public getRecipes(searchTerm?: string, tags?: string[]): Observable<Recipe[]> {
    const key = JSON.stringify({ searchTerm, tags })
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        this.fetchRecipesFromFirestore(searchTerm, tags).pipe(
          tap(recipes => recipes.map(r => this.entityCache.set(r.id, r))),
          shareReplay(1)
        )
      )
    }
    return this.cache.get(key)!
  }

  public createRecipe(recipe: Recipe): Observable<any> {
    const recipesRef = collection(this.firestore, 'recipes')
    return from(addDoc(recipesRef, recipe)).pipe(
      tap(() => {
        this.cache.clear()
        this.entityCache.clear()
      })
    )
  }

  public updateRecipe(id: string, recipe: Partial<Recipe>): Observable<any> {
    const recipeRef = doc(this.firestore, `recipes/${id}`)
    return from(updateDoc(recipeRef, recipe)).pipe(
      tap(() => {
        this.cache.clear()
        this.entityCache.clear()
      })
    )
  }

  public deleteRecipe(id: string): Observable<any> {
    const recipeRef = doc(this.firestore, `recipes/${id}`)
    return from(deleteDoc(recipeRef)).pipe(
      tap(() => {
        this.cache.clear()
        this.entityCache.delete(id)
      })
    )
  }

  public getRecipeById(id: string): Observable<Recipe> {
    const cached = this.entityCache.get(id)
    if (cached) return of(cached)
    const recipeRef = doc(this.firestore, `recipes/${id}`)
    return docData(recipeRef, { idField: 'id' }).pipe(
      take(1),
      tap(recipe => {
        if (recipe) {
          this.entityCache.set(id, recipe as Recipe)
        }
      })
    ) as Observable<any>
  }

  public clearCache(): void {
    this.cache.clear()
    this.entityCache.clear()
  }

  private fetchRecipesFromFirestore(searchTerm?: string, tags?: string[]): Observable<Recipe[]> {
    const recipesRef = collection(this.firestore, 'recipes')
    const search = searchTerm?.toLowerCase().trim() || ''
    const tagList = Array.isArray(tags) ? tags.map(t => t) : [] as string[]

    // Case 1: no searchTerm and no tags → return all
    if (!search && tagList.length === 0) {
      return collectionData(recipesRef, { idField: 'id' }) as Observable<Recipe[]>
    }

    let recipesQuery: Query = recipesRef

    // Case 2: searchTerm only
    if (search && tagList.length === 0) {
      recipesQuery = this.searchQuery(search)
    }

    // Case 3: tags only
    if (!search && tagList.length > 0) {
      recipesQuery = this.tagQuery(tagList)
    }

    // Case 4: both searchTerm and tags
    if (search && tagList.length > 0) {
      recipesQuery = this.searchAndTagQuery(search, tagList)
    }

    return collectionData(recipesQuery, { idField: 'id' }) as Observable<Recipe[]>
  }

  private tagQuery(tagList: string[]): Query {
    const recipesRef = collection(this.firestore, 'recipes')
    return query(
      recipesRef,
      where('tags', 'array-contains-any', tagList)
    )
  }

  private searchQuery(search: string): Query {
    const recipesRef = collection(this.firestore, 'recipes')
    return query(
      recipesRef,
      where('name', '>=', search),
      where('name', '<=', search + '\uf8ff')
    )
  }

  private searchAndTagQuery(search: string, tagList: string[]): Query {
    const recipesRef = collection(this.firestore, 'recipes')
    return query(
      recipesRef,
      where('name', '>=', search),
      where('name', '<=', search + '\uf8ff'),
      where('tags', 'array-contains-any', tagList)
    )
  }
}
