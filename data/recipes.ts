export type RecipeIngredient = {
  ingredientId: number;
  amount: number;
};

export type Recipe = {
  id: number;
  slug: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
};

export const recipes: Recipe[] = [
  {
    id: 1,
    slug: "chicken-curry",
    name: "Chicken Curry",
    servings: 4,
    ingredients: [
      { ingredientId: 1, amount: 600 },
      { ingredientId: 3, amount: 400 },
    ],
    instructions: [
      "Cook the chicken until golden.",
      "Add curry sauce and simmer.",
      "Serve with rice or optional side dish.",
    ],
  },
  {
    id: 2,
    slug: "greek-yogurt-bowl",
    name: "Greek Yogurt Bowl",
    servings: 1,
    ingredients: [{ ingredientId: 2, amount: 250 }],
    instructions: [
      "Add yogurt to a bowl.",
      "Top with fruit, oats or honey.",
      "Serve cold.",
    ],
  },
];