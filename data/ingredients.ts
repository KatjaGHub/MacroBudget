export type Ingredient = {
  id: number;
  name: string;
  emoji: string;
  unit: "g" | "pcs";
  calories: number;
  protein: number;
  cost: number;
};

export const ingredients: Ingredient[] = [
  {
    id: 1,
    name: "Chicken breast",
    emoji: "🍗",
    unit: "g",
    calories: 110,
    protein: 23,
    cost: 0.85,
  },
  {
    id: 2,
    name: "Greek yogurt",
    emoji: "🥛",
    unit: "g",
    calories: 59,
    protein: 10,
    cost: 0.35,
  },
  {
    id: 3,
    name: "Rice",
    emoji: "🛒",
    unit: "g",
    calories: 130,
    protein: 2,
    cost: 0.2,
  },
  {
    id: 4,
    name: "Cucumber",
    emoji: "🥬",
    unit: "pcs",
    calories: 30,
    protein: 1,
    cost: 0.7,
  },
];