import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.productOption.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurant.deleteMany();

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Garnish Kitchen",
      description: "Fresh burgers, pizzas, wraps and more",
      image: "/images/wendy-burger-search.png",
      rating: 4.5,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      minOrder: 10,
      isActive: true,
    },
  });

  const [burgers, pizza, wrap, burrito, drinks, desserts] =
    await Promise.all([
      prisma.category.create({
        data: {
          name: "Burgers",
          description: "Juicy handcrafted burgers",
          image: "/images/wendy-burger-search.png",
        },
      }),
      prisma.category.create({
        data: {
          name: "Pizza",
          description: "Wood-fired artisan pizzas",
          image: "/images/margerritta-magic-pizza-search.png",
        },
      }),
      prisma.category.create({
        data: {
          name: "Wrap",
          description: "Fresh tortilla wraps",
          image: "/images/chicken-wrap-search.png",
        },
      }),
      prisma.category.create({
        data: {
          name: "Burrito",
          description: "Loaded burritos",
          image: "/images/big-beer-burito-search.png",
        },
      }),
      prisma.category.create({
        data: {
          name: "Drinks",
          description: "Refreshing beverages",
          image: "/images/lemonade-search.webp",
        },
      }),
      prisma.category.create({
        data: {
          name: "Desserts",
          description: "Sweet treats",
          image: "/images/brownie-search.webp",
        },
      }),
    ]);

  const products = [
    {
      name: "Wendy's Burger",
      description:
        "The Deluxiously Wendy's Burger is a creation like no other. This massive burger with a giant patty is piled high with fresh lettuce, tomatoes, crispy onions, jalapeños, and a drizzling sauce.",
      price: 10.4,
      image: "/images/wendy-burger-search.png",
      calories: 850,
      protein: 45,
      rating: 4.8,
      categoryId: burgers.id,
    },
    {
      name: "Veggie Burger",
      description:
        "A wholesome plant-based burger loaded with fresh veggies, crispy lettuce, tomato slices, and our signature herb mayo sauce.",
      price: 10.4,
      image: "/images/veggie-burger-search.png",
      calories: 620,
      protein: 22,
      rating: 4.5,
      categoryId: burgers.id,
    },
    {
      name: "Margherita Magic",
      description:
        "Classic Italian pizza with San Marzano tomato sauce, fresh mozzarella, basil leaves, and a drizzle of extra virgin olive oil on a wood-fired crust.",
      price: 10.4,
      image: "/images/margerritta-magic-pizza-search.png",
      calories: 750,
      protein: 28,
      rating: 4.7,
      categoryId: pizza.id,
    },
    {
      name: "Veggie Delight",
      description:
        "A colorful pizza topped with roasted bell peppers, mushrooms, olives, artichoke hearts, and a blend of Italian cheeses.",
      price: 10.4,
      image: "/images/veggie-pizza-search.png",
      calories: 680,
      protein: 24,
      rating: 4.4,
      categoryId: pizza.id,
    },
    {
      name: "Chicken Wrap",
      description:
        "Grilled chicken breast wrapped in a warm flour tortilla with crisp romaine lettuce, cherry tomatoes, cheddar cheese, and ranch dressing.",
      price: 10.4,
      image: "/images/chicken-wrap-search.png",
      calories: 550,
      protein: 38,
      rating: 4.6,
      categoryId: wrap.id,
    },
    {
      name: "Big Beef Burrito",
      description:
        "A hearty burrito packed with seasoned ground beef, Mexican rice, black beans, sour cream, guacamole, and pico de gallo.",
      price: 10.4,
      image: "/images/big-beer-burito-search.png",
      calories: 920,
      protein: 42,
      rating: 4.7,
      categoryId: burrito.id,
    },
    {
      name: "Classic Cheeseburger",
      description:
        "A timeless classic with a juicy beef patty, melted American cheese, pickles, onions, ketchup, and mustard on a sesame seed bun.",
      price: 8.9,
      image: "/images/wendy-burger-search.png",
      calories: 720,
      protein: 40,
      rating: 4.6,
      categoryId: burgers.id,
    },
    {
      name: "Pepperoni Pizza",
      description:
        "Generous slices of pepperoni layered over mozzarella cheese and our signature tomato sauce on a hand-tossed crust.",
      price: 12.5,
      image: "/images/veggie-pizza-search.png",
      calories: 820,
      protein: 32,
      rating: 4.5,
      categoryId: pizza.id,
    },
    {
      name: "Chicken Caesar Wrap",
      description:
        "Tender grilled chicken with romaine lettuce, parmesan cheese, and creamy Caesar dressing wrapped in a spinach tortilla.",
      price: 9.5,
      image: "/images/chicken-wrap-search.png",
      calories: 480,
      protein: 35,
      rating: 4.3,
      categoryId: wrap.id,
    },
    {
      name: "Chicken Burrito",
      description:
        "Grilled chicken with cilantro lime rice, pinto beans, fresh salsa, cheese, and sour cream in a large flour tortilla.",
      price: 11.2,
      image: "/images/big-beer-burito-search.png",
      calories: 780,
      protein: 38,
      rating: 4.4,
      categoryId: burrito.id,
    },
    {
      name: "Lemonade",
      description: "Freshly squeezed lemonade with a hint of mint, served ice cold.",
      price: 3.5,
      image: "/images/lemonade-search.webp",
      calories: 120,
      protein: 0,
      rating: 4.2,
      categoryId: drinks.id,
    },
    {
      name: "Chocolate Brownie",
      description:
        "Rich and fudgy chocolate brownie topped with a scoop of vanilla ice cream and drizzled with chocolate sauce.",
      price: 5.9,
      image: "/images/brownie-search.webp",
      calories: 450,
      protein: 6,
      rating: 4.8,
      categoryId: desserts.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    });
  }

  console.log(`Seeded: 1 restaurant, 6 categories, ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
