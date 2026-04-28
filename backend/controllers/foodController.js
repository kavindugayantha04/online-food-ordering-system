const FoodItem = require("../models/FoodItem");

// Add food item
exports.addFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, availability } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const food = new FoodItem({
      name,
      description,
      price,
      category,
      availability: availability === "false" ? false : true,
      image: req.file ? `/uploads/foods/${req.file.filename}` : "",
    });

    const savedFood = await food.save();

    res.status(201).json({
      message: "Food item added successfully",
      data: savedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all food items
exports.getAllFoodItems = async (req, res) => {
  try {
    const foods = await FoodItem.find().sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one food item
exports.getFoodItemById = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food item
exports.updateFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    food.name = req.body.name || food.name;
    food.description = req.body.description || food.description;
    food.price = req.body.price || food.price;
    food.category = req.body.category || food.category;

    if (req.body.availability !== undefined) {
      food.availability = req.body.availability === "false" ? false : true;
    }

    if (req.file) {
      food.image = `/uploads/foods/${req.file.filename}`;
    }

    const updatedFood = await food.save();

    res.status(200).json({
      message: "Food item updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food item
exports.deleteFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    await food.deleteOne();

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};