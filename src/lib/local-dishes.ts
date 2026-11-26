export interface LocalDish {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  taste: string;
  commonIngredients: string[];
  allergenHints: string[];
  cuisineSearch: string;
  image: string;
}

export const LOCAL_DISHES: LocalDish[] = [
  {
    id: "paella",
    name: "Paella Valenciana",
    city: "Barcelona",
    country: "Spain",
    category: "Rice",
    taste: "Saffron-scented rice with chicken and rabbit; coastal versions often add seafood.",
    commonIngredients: ["rice", "saffron", "chicken", "beans"],
    allergenHints: ["May contain shellfish in seafood versions — ask"],
    cuisineSearch: "Spanish",
    image:
      "https://images.unsplash.com/photo-1534080564583-6da87748afd6?w=900&q=80".replace(
        "1534080564583-6da87748afd6",
        "1529042410759-befb1204b468",
      ),
  },
  {
    id: "bombas",
    name: "Bombas",
    city: "Barcelona",
    country: "Spain",
    category: "Tapas",
    taste: "Crispy potato croquettes with spicy sauce — classic Barceloneta bar bite.",
    commonIngredients: ["potato", "meat", "aioli"],
    allergenHints: ["Egg/dairy possible in sauces — confirm"],
    cuisineSearch: "Spanish",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&q=80",
  },
  {
    id: "bacalhau",
    name: "Bacalhau à Brás",
    city: "Lisbon",
    country: "Portugal",
    category: "Fish",
    taste: "Shredded salt cod with eggs, onions and crisp potatoes — comfort classic.",
    commonIngredients: ["salt cod", "egg", "potato", "onion"],
    allergenHints: ["Fish, eggs — confirm preparation"],
    cuisineSearch: "Traditional local food",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80",
  },
  {
    id: "pastel",
    name: "Pastel de nata",
    city: "Lisbon",
    country: "Portugal",
    category: "Sweet",
    taste: "Flaky custard tart — best warm from a bakery.",
    commonIngredients: ["egg", "cream", "pastry", "cinnamon"],
    allergenHints: ["Eggs, milk, gluten common"],
    cuisineSearch: "Traditional local food",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80",
  },
];
