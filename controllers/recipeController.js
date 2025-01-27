const Recipe = require("../models/Recipe");

const recipeController = {
  createRecipe: async (request, response) => {
    try {
      console.log(request.body);

      // get the details from the request body
      const { Title, Ingredients, Instructions } = request.body;

      // validate the email
      const recipe = await Recipe.findOne({ Title });

      //if the Title is already in use, send a response
      if (recipe) {
        return response
          .status(400)
          .json({ message: "A recipe with this title already exists." });
      }

      //Create a model object
      const newRecipe = new Recipe({ Title, Ingredients, Instructions });

      //Save the recipe to the database
      await newRecipe.save();

      //Send a response
      response.status(201).json({ newRecipe });
    } catch (error) {
      response.status(500).json({ massage: error.message });
    }
  },
  getAllRecipes: async (request, response) => {
    try {
      const recipes = await Recipe.find();
      //Send a response
      response.json(recipes);
    } catch (error) {
      response.status(500).json({ massage: error.message });
    }
  },
  getRecipeById: async (request, response) => {
    try {
      //get the recipe ID from the request params
      const { id } = request.params;

      //find the recipe by ID
      const recipe = await Recipe.findById(id);

      //Send a response
      response.json(recipe);
    } catch (error) {
      response.status(500).json({ massage: error.message });
    }
  },
  updateRecipe: async (request, response) => {
    try {
      console.log(request.body);

      //get the recipe ID from the request params
      const { id } = request.params;

      // get the data from the request body
      const { Title, Ingredients, Instructions } = request.body;

      //Create a update recipe object and update it
      const updatedRecipe = { Title, Ingredients, Instructions };

      //find the recipe by ID
      const recipe = await Recipe.findByIdAndUpdate(id, updatedRecipe, {
        new: true,
      });

      //Send a response
      response.json(recipe);
    } catch (error) {
      response.status(500).json({ massage: error.message });
    }
  },
  deleteRecipe: async (request, response) => {
    try {
      //get the recipe ID from the request params
      const { id } = request.params;

      //Delete the recipe by ID
      await Recipe.findByIdAndDelete(id);

      //Send a response
      response.json({ messaage: "Recipe deleted successfully" });
    } catch (error) {
      response.status(500).json({ massage: error.message });
    }
  },
};

module.exports = recipeController;
