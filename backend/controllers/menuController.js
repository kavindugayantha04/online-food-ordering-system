const MenuItem = require("../models/FoodItem");

exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await FoodItem.find().sort({ createdAt: -1 });

    res.status(200).json(
      menuItems.map((item) => ({
        id: item._id,
        name: item.name,
        foodName: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        availability: item.availability,
      }))
    );
  } catch (error) {
    console.error("Get menu items error:", error.message);
    res.status(500).json({ message: "Server error fetching menu items" });
  }
};