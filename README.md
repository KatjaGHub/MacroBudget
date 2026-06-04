# MacroBudget

MacroBudget is a cozy meal planning and food budgeting app for people who want to track nutrition, groceries, recipes, household planning, and weight progress in one clean place.

It started from a simple idea: MyFitnessPal-style macro tracking, but with real grocery costs, shared household planning, and a softer, friendlier interface.

## What It Does

MacroBudget helps you answer the daily food questions without opening five different apps:

- What am I eating today?
- How many calories and grams of protein am I getting?
- How much does this meal or week of food cost?
- What do we need to buy?
- Am I moving toward my weight goal?

## Features

### Account And Household

- Email authentication with Supabase
- Shared households
- Household invite codes
- Shared ingredients, recipes, meal plans, shopping list, and weight graph

### Ingredients

- Ingredient database per household
- Calories, protein, unit, package size, and package price
- Automatic cost calculation per 100g or per piece
- Searchable ingredient list

### Recipes

- Recipe builder from saved ingredients
- Calories, protein, and cost per serving
- Recipe detail pages
- Instructions support
- Searchable recipe collection

### Meal Planning

- Plan breakfast, lunch, dinner, and snacks
- Add recipes or individual ingredients
- Daily totals for calories, protein, and cost
- Weekly planning view

### Shopping List

- Shared household shopping list
- Optional quantities
- Mark items as bought
- Realtime sync-ready structure through Supabase

### Health And Goals

- Weight logging
- Household weight progress graph
- BMI calculation
- Recommended calories
- Recommended protein
- Manual calorie and protein targets
- Goal weight tracking
- Remaining kg and goal progress
- Achievement-style progress messages

### App Experience

- Mobile-friendly responsive layouts
- Bottom navigation on mobile
- Desktop navigation preserved
- PWA metadata and install support
- Light, dark, and system theme modes
- English, Slovenian, and German UI language support
- Language preference saved to Supabase

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file with your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Useful Commands

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Project Status

MacroBudget is actively being built and polished. The core app is functional: auth, households, ingredients, recipes, meal planning, shopping, weight tracking, goal tracking, dark mode, localization, and PWA support are already in place.

The current focus is quality: mobile usability, smoother flows, better UI consistency, and small production-ready fixes.

## Roadmap

Planned or possible future improvements:

- More mobile polish
- Better goal weight insights
- More detailed nutrition tracking
- Improved household collaboration
- Optional reminder architecture
- AI-assisted meal, shopping, and recipe suggestions

Push notifications and AI features are intentionally not part of the current core app.

## Design Direction

MacroBudget is meant to feel:

- cute but clean
- soft and friendly
- practical for daily use
- mobile-first where it matters
- calm instead of spreadsheet-heavy

The pink/rose visual identity is part of the product, not just decoration.

## Author

Made to make meal planning, weight goals, and food budgeting feel a little less chaotic and a lot more doable.
