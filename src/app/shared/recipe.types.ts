export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert'
] as const;

export type RecipeCategory = typeof RECIPE_CATEGORIES[number];

