const MenuItem = require("../models/MenuItem");

const defaultMenuItems = [
  {
    name: "Cheese Burger",
    description: "Juicy burger with cheese",
    price: 8.5,
    category: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Chicken Pizza",
    description: "Chicken pizza with fresh toppings",
    price: 12,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Veggie Wrap",
    description: "Healthy wrap with vegetables",
    price: 7.25,
    category: "Wrap",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "French Fries",
    description: "Crispy golden fries",
    price: 4,
    category: "Sides",
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Orange Juice",
    description: "Fresh orange juice",
    price: 3.5,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1200&auto=format&fit=crop",
  },
];

exports.getMenuItems = async (req, res) => {
  try {
    let menuItems = await MenuItem.find({ isAvailable: true }).sort({ createdAt: 1 });

    // Seed a few starter menu items so the cart screen works
    // before the dedicated menu module is completed.
    if (menuItems.length === 0) {
      await MenuItem.insertMany(defaultMenuItems);
      menuItems = await MenuItem.find({ isAvailable: true }).sort({ createdAt: 1 });
    }

    return res.status(200).json(
      menuItems.map((item) => ({
        id: item._id,
        foodName: item.name,
        price: item.price,
        description: item.description,
        category: item.category,
        image: item.image,
      }))
    );
  } catch (error) {
    console.error("Get menu items error:", error.message);
    return res.status(500).json({ message: "Server error fetching menu items" });
  }
};
