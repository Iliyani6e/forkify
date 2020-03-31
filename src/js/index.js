import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

import { elements, renderLoader, clearLoader } from "./views/base";

//Global state of the app
// * - Search object
// * - Current recipe object
// * - Shopping list object
// * - Liked recipes

const state = {};

window.state = state;

//SEARCH CONTROLLER

const controllSearch = async () => {
  // 1. Get the query from the view
  const query = searchView.getInput(); //TODO

  if (query) {
    //2.New search object add to state
    state.search = new Search(query);
    //3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      //4.Search for recepis
      await state.search.getResults();
      //5.Render the results in the UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert(err);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controllSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const gotoPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, gotoPage);
  }
});

//RECEPI CONTROLLER

const controlRecipe = async () => {
  //Get the ID from the URL
  const id = window.location.hash.replace("#", "");
  //  console.log(id);
  if (id) {
    //Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    //Hghlight selected item
    if (state.search) searchView.highlightSelected(id);

    //Create new recipe object
    state.recipe = new Recipe(id);

    try {
      //Get the recipe data and parse the ingredients
      await state.recipe.getRecipe();
      // console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      //Calculate servings and time
      state.recipe.calcServings();
      state.recipe.calcTime();
      //Render the recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      // console.log(state.recipe.ingredients);
    } catch (err) {
      alert(err);
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach(event => {
  window.addEventListener(event, controlRecipe);
});

//LIST CONTROLLER
const controlList = () => {
  //create a new list if there is none yet
  if (!state.list) {
    state.list = new List();
  }
  //Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle the delete and update events
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle the delete button
  if (e.target.matches(".shopping__delete,.shopping__delete *")) {
    //Delete from state
    state.list.deleteItem(id);

    //Delete from UI
    listView.deleteItem(id);
    //Handle the count  update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);

    if (val >= 0) state.list.updateCount(id, val);
  }
});

/*******************/
//LIKES CONTROLLER
//****************/
//TESTING
state.likes = new Likes();

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  //The current recipe IS NOT liked yet
  if (!state.likes.isLiked(currentID)) {
    //Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //Toggle the like button
    likesView.toggleLikeBtn(true);
    //Add like to the UI list
    console.log(state.likes);
    //The current recipe IS liked yet
  } else {
    //Remove like from the state
    state.likes.deleteLike(currentID);
    //Toggle the like button
    likesView.toggleLikeBtn(false);
    //Remove like from the UI list
  }
};

//Handling recipe button clicks

elements.recipe.addEventListener("click", e => {
  // The '*' symbol after the btn-decrease class means 'the event will be triggered if clicked on any child of the element with this class'
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add,.recipe__btn--add *")) {
    //Add ingredietn to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love,.recipe__love *")) {
    //Like controller
    controlLike();
  }
  // console.log(state.recipe);
});
