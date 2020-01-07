import Search from "./models/Search";
//Global state of the app
// * - Search object
// * - Current recipe object
// * - Shopping list object
// * - Liked recipes

const state = {};

const controllSearch = async () => {
  // 1. Get the query from the view
  const query = "pizza"; //TODO
  if (query) {
    //2.New search object add to state
    state.search = new Search(query);
    //3. Prepare UI for results

    //4.Search for recepis
    await state.search.getResults();
    //5.Render the results in the UI
    console.log(state.search.result);
  }
};

document.querySelector(".search").addEventListener("submit", e => {
  e.preventDefault();
  controllSearch();
});
