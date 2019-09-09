import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResult = () =>{
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const hightlightSelected = id =>{
  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  resultsArr.forEach(el => {
      el.classList.remove('results__link--active')
  })
  //document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
  const test = document.querySelector(`.results__link[href="#${id}"]`);     if (test) document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active')
};

export const limitRecipeTitle = (title, limit = 17) =>{
   const newTitle = []
   if(title.length > limit){
    title.split(' ').reduce((acc, cur)=> {
            if(acc + cur.length <= 17){
               newTitle.push(cur)
            }
            return acc  + cur.length
    }, 0)
    // return the result of the newTitle then join it together again into a string 
    return `${newTitle.join(' ')}...`
   }
   return title;
};

const renderRecipe = recipe =>{
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
   </li>
`
elements.searchResList.insertAdjacentHTML('beforeend', markup)
};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev'? page - 1 : page  + 1}>
      <span>Page ${type === 'prev'? page - 1 : page  + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;


const renderButtons  = (page, numRes, resPerPage) =>{
   const pages = Math.ceil(numRes / resPerPage);

   let button;

   if(page === 1 && pages > 1){
       //render button to the next page
     button =  createButton(page, 'next')
   } else if(page < pages){
       //render 2 buttons one to the next page and other to the previous page
     button = `
        ${createButton(page, 'next')}
        ${createButton(page, 'prev')}
     `
   } else if(page === pages && pages > 1){
       //only button to the previous page
     button = createButton(page, 'prev')
   }

   elements.searchResPages.insertAdjacentHTML('afterbegin', button)
};

export const renderResultes = (recipes, page = 1, recPerPage = 10) =>{
    //render result of current page
    let start = (page - 1) * recPerPage;
    let end = page * recPerPage;
    recipes.slice(start, end).forEach(renderRecipe)

    //render the pagination button
    renderButtons(page, recipes.length, recPerPage)
};