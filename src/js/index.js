import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import { elements, renderLoader, clearLoader } from "./views/base";

//Global state of the app
// * - Search object
// * - Current recipe object
// * - Shopping list object
// * - Liked recipes

const state = {};

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

    //Create new recipe object
    state.recipe = new Recipe(id);

    try {
      //Get the recipe data and parse the ingredients
      await state.recipe.getRecipe();
      console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      //Calculate servings and time
      state.recipe.calcServings();
      state.recipe.calcTime();
      //Render the recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
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
