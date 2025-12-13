import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Query } from 'firebase/firestore/lite'
import { Observable } from 'rxjs';

export interface Recipe {
  id: string;
  title: string;
  calories: number;
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private firestore = inject(Firestore);


  getRecipes(searchTerm?: string, tags?: string[]): Observable<Recipe[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    const search = searchTerm?.toLowerCase().trim() || '';
    const tagList = Array.isArray(tags) ? tags.map(t => t) : [] as string[];

    // Case 1: no searchTerm and no tags → return all
    if (!search && tagList.length === 0) {
      console.log('Fetching all recipes');
      return collectionData(recipesRef, { idField: 'id' }) as Observable<Recipe[]>;
    }

    let recipesQuery: Query = recipesRef;

    // Case 2: searchTerm only
    if (search && tagList.length === 0) {
      console.log(`Fetching recipes with search term: ${search}`);
      recipesQuery = query(
        recipesRef,
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff')
      );
    }

    // Case 3: tags only
    if (!search && tagList.length > 0) {
      recipesQuery = query(
        recipesRef,
        where('tags', 'array-contains-any', tagList)
      );
    }

    // Case 4: both searchTerm and tags
    if (search && tagList.length > 0) {
      console.log(`Fetching recipes with search term: ${search} and tags: ${tagList.join(', ')}`);
      recipesQuery = query(
        recipesRef,
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff'),
        where('tags', 'array-contains-any', tagList)
      );
    }

    return collectionData(recipesQuery, { idField: 'id' }) as Observable<Recipe[]>;

  }
}
