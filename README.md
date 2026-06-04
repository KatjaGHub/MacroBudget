# MacroBudget ♡

**A cozy food budgeting and macro tracking app for meals, groceries, recipes, goals, and shared households.**

MacroBudget is for the tiny daily question that somehow becomes a whole spreadsheet:

> What are we eating, what does it cost, and is it helping my goals?

It keeps meal planning, nutrition, grocery costs, shopping, and weight progress in one soft pink place. Cute enough to enjoy opening, practical enough to use every day.

---

## 🌸 The Vibe

MacroBudget is built to feel:

- cute but clean
- soft, pink, and friendly
- useful on a phone
- calm instead of spreadsheet-heavy
- made for real meals, real groceries, and real life

No overwhelming dashboards. No budget chaos. Just food planning that feels a little more doable.

---

## ✨ What You Can Do

### 🏡 Account + Household

- Sign in with Supabase auth
- Create or join a household
- Share ingredients, recipes, meal plans, shopping, and progress
- Use invite codes to connect with your partner or household

### 🥗 Ingredients

- Save ingredients with calories, protein, unit, package size, and price
- Calculate cost per `100g` or per piece
- Search your ingredient database
- Keep grocery data tied to your household

### 🍳 Recipes

- Build recipes from saved ingredients
- See calories, protein, and cost per serving
- Add cooking instructions
- Browse and search your recipe collection

### 🗓️ Meal Planning

- Plan breakfast, lunch, dinner, and snacks
- Add full recipes or individual ingredients
- View daily totals for calories, protein, and cost
- Plan across the week without duplicating pages or flows

### 🛒 Shopping List

- Shared grocery list for the household
- Add optional quantities
- Mark items as bought
- Keep shopping simple and synced around the household model

### 🌷 Health + Goals

- Log daily weight
- View household weight progress
- Calculate BMI
- Get recommended calories
- Get recommended protein
- Set manual calorie and protein targets
- Track goal weight progress
- See remaining kg and achievement-style progress messages

### 🌙 App Experience

- Mobile-friendly responsive UI
- Bottom navigation on mobile
- Desktop navbar stays clean
- PWA install support
- Light, dark, and system theme modes
- English, Slovenian, and German UI
- Language preference saved to Supabase

---

## 🧁 Why MacroBudget Exists

Most food apps track calories.

Most budgeting tools track money.

MacroBudget tries to sit in the sweet little middle:

```text
meal planning + macro tracking + grocery cost awareness + household sharing
```

So you can plan food that fits your body, your wallet, and your week.

---

## 🛠️ Tech Stack

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **Lucide React**

---

## 🚀 Getting Started

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

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🧪 Useful Commands

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

---

## 📌 Current Status

MacroBudget is actively being built and polished.

Already working:

- auth
- households
- ingredients
- recipes
- meal planning
- shopping list
- weight logging
- BMI
- calorie and protein recommendations
- calorie and protein targets
- goal weight tracking
- dark mode
- localization
- PWA support
- mobile navigation

Current focus:

- mobile polish
- UI consistency
- small production-quality fixes
- making the app feel nicer to use every day

---

## 🗺️ Roadmap

Planned or possible future improvements:

- 📱 more mobile usability polish
- 🌷 better goal weight insights
- 🥦 more detailed nutrition tracking
- 🏡 smoother household collaboration
- 🤖 optional AI meal, recipe, and shopping suggestions later

Not currently planned:

- push notifications
- notification reminders

---

## 💖 Design Direction

MacroBudget is intentionally soft and friendly.

The pink/rose branding is part of the product feeling: gentle, warm, and a little cute, while still being clean enough for daily tracking.

The goal is not to make food tracking feel like homework. The goal is to make it feel manageable.

---

## 🩷 Author

Made to make meal planning, weight goals, and food budgeting feel less chaotic and more like something you can actually keep doing.
