import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes'
import * as listView from './views/listView'
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likesView'
import {elements, renderLoader, clearLoader} from './views/base';



//========================
//globale state of the app:

const state = {};

//=========================


//====================
//Search Controller
//====================

const controllSearch = async () =>{
  //1. get query from the View

  const query = searchView.getInput();

  console.log(query)

  if(query){
      //2. search object and add to state 

      state.search = new Search(query)

      //3. prepare UI for result

      searchView.clearInput();
      searchView.clearResult();
      renderLoader(elements.searchRes)
    try {
      //4. search for recipe and use await to wait for the result befor rendering it 

      await state.search.getResult()

      //5. render recipe
      clearLoader()
      searchView.renderResultes(state.search.result)

    } catch(error){
      console.log(error)
      alert('Something went wrong with the Search controller :(')
      clearLoader()
    }
  }
};

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault()
    controllSearch();
});

elements.searchResPages.addEventListener('click', e =>{
 const btn = e.target.closest('.btn-inline');
 if(btn){
   const goToPage = parseInt(btn.dataset.goto, 10);
   searchView.clearResult();
   searchView.renderResultes(state.search.result, goToPage)
 }
});

//=====================
//Recipe Controller
//=====================

const controlRecipe = async () =>{
  //get data from the url
  const id = window.location.hash.replace('#', '');

  if(id){
    //1. prepare UI for changes
    recipeView.clearRecipe()
    renderLoader(elements.recipe)

    //hightlightItem

    if(state.search) searchView.hightlightSelected(id);

  try {
    //2. create new recipe object

     state.recipe = new Recipe(id)

    //3. get recipe data and parse ingredients
   
    await state.recipe.getRecipe()
    state.recipe.parseIngredients()
    
    //.4 calculate serving and time 

      state.recipe.calcTime();
      state.recipe.calcServing();

    //.5 render recipe
     clearLoader();
     recipeView.renderRecipe(
       state.recipe,
       state.likes.isLiked(id)
       );

    } catch(error){
      console.log(error)
    }
  }
};

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe))

//======================
//List controller
//======================
const controlList = () =>{
  //create a new list if there is not one
  if(!state.list) state.list = new List();

  //add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el =>{
   const item = state.list.addItem(el.count, el.unit, el.ingredient)
   listView.renderItem(item)
  })

};

//handle delete and update list items
elements.shopping.addEventListener('click', e =>{
   const id = e.target.closest('.shopping__item').dataset.itemid;

   //handle the delete button 

   if(e.target.matches('.shopping__delete, .shopping__delete *')){
   //delte item from state 
  
   state.list.deleteItem(id)

   //delete item from UI
   listView.deleteItem(id)

   //handle the count update
   } else if(e.target.matches('.shopping__count-value')){
      const val = parseFloat(e.target.value, 10)
      state.list.updateCount(id, val);
   }
});
//===================
//like controller
//==================
state.likes = new Likes()
likesView.toggleLikeMenu(state.likes.getNumOfLikes())

const controlLike = () => {
 if(!state.likes) state.likes = new Likes();
 const currentID = state.recipe.id;

 //if user has not yet liked the current recipe
 if(!state.likes.isLiked(currentID)){
   // Add the liked recipe to the state
  const newLike  = state.likes.addLike(
    currentID,
    state.recipe.title,
    state.recipe.author,
    state.recipe.img
  );

   //toggle the like button
   
   likesView.toggleLikeBtn(true)

   //add like to UI list

   likesView.renderLikes(newLike)

  //if user has already liked the current recipe
   } else {
      //Remove like from the state
      state.likes.deleteLike(currentID)

      //Toggle the like button
    likesView.toggleLikeBtn(false)
      //Remove like from UI list
     likesView.deleteLike(currentID)

   }

   likesView.toggleLikeMenu(state.likes.getNumOfLikes())
 }

//===========================================
//Restore the liked recipe after page loading
//===========================================
window.addEventListener('load', () =>{
  state.likes = new Likes();
  //restore likes
  state.likes.readStorage();
  //toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumOfLikes());
  //render the existing likes
  state.likes.likes.forEach(like => likesView.renderLikes(like))
})

//======================================
//handling all the buttons in the recipe
//======================================
elements.recipe.addEventListener('click', e =>{
  if(e.target.matches('.btn-decrease, .btn-decrease *')){
      //decrease button was clicked
     if(state.recipe.serving > 1) {

      state.recipe.updateServings('dec')
      recipeView.updateServingIng(state.recipe)
     }
  } else if(e.target.matches('.btn-increase , .btn-increase *')){
     //increase button was clicked
     state.recipe.updateServings('inc')
     recipeView.updateServingIng(state.recipe)
  } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
    //add ingredients to shopping list
    controlList()
  } else if(e.target.matches('.recipe__love, .recipe__love *')){
    //like controller
    controlLike();
  }
});

