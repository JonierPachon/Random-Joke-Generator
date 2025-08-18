const categoryCheckboxes = document.querySelectorAll('input[name="category"');
const anyCategoryCheckbox = document.querySelector("#any-joke");
const filterToggleBtn = document.querySelector("#filter-toggle");
const newJokeBtn = document.querySelector(".display-joke__button");
const jokeDisplay = document.querySelector("#joke");
const displayFilters = document.querySelector(".filters");
const displayJokeFirstContainer = document.querySelector(
   ".display-joke__joke-first-part"
);
const displayJokeSecondContainer = document.querySelector(
   ".display-joke__joke-two-parts"
);
const displayLoading = document.querySelector(".display-joke__loading");

// utility to show or hide an element by toggling the "-close" class
function toggleElementVisibility(element, show) {
   element.classList.toggle(`${element.classList[0]}-close`, !show);
}

// show or hide filters and joke containers
function toggleFilters() {
   displayFilters.classList.toggle("filters-close");
   if (displayFilters.classList.contains("filters-close")) {
      if (jokeDisplay.innerHTML !== "") {
         toggleElementVisibility(displayJokeFirstContainer, true);
         if (displayJokeSecondContainer.innerHTML !== "") {
            toggleElementVisibility(displayJokeSecondContainer, true);
         }
      }
   } else {
      toggleElementVisibility(displayJokeFirstContainer, false);
      toggleElementVisibility(displayJokeSecondContainer, false);
   }
}

// Ensure "any" is selected if no other categories are checked
function handleCategoryChange() {
   if ([...categoryCheckboxes].some((cb) => cb.checked)) {
      anyCategoryCheckbox.checked = false;
   } else {
      anyCategoryCheckbox.checked = true;
   }
}

// Uncheck all categories when "Any" is selected
function handleAnyCategory() {
   if (anyCategoryCheckbox.checked) {
      categoryCheckboxes.forEach((cb) => (cb.checked = false));
   } else if (![...categoryCheckboxes].some((cb) => cb.checked)) {
      anyCategoryCheckbox.checked = true;
   }
}

// ----------------------------------------------------------------------------------

// Build the API URL based on user selections

function getSelectedCategories() {
   return [...categoryCheckboxes]
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
}

function getBacklistFlags() {
   return [
      ...document.querySelectorAll('input[Type="checkbox"][name^="option"]'),
   ]
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
}

function buildApiUrl() {
   const categories = getSelectedCategories();
   const flags = getBacklistFlags();
   let url = `https://v2.jokeapi.dev/joke/${
      categories.length ? categories.join(",") : "Any"
   }`;
   if (flags.length) {
      url += `?blacklistFlags=${flags.join(",")}`;
   }
   return url;
}

// Fetch a joke and display it to the user
async function fetchAndDisplayJoke() {
   toggleElementVisibility(displayFilters, false);
   toggleElementVisibility(displayJokeSecondContainer, false);

   jokeDisplay.innerHTML = "";
   toggleElementVisibility(displayJokeFirstContainer, true);
   toggleElementVisibility(displayLoading, true);

   try {
      const response = await fetch(buildApiUrl());
      const data = await response.json();
      const jokes = data.jokes || [data];
      jokes.forEach((jokeObj) => {
         toggleElementVisibility(displayLoading, false);
         if (jokeObj.type === "single") {
            displayJokeSecondContainer.innerHTML = "";
            jokeDisplay.textContent = jokeObj.joke;
            toggleElementVisibility(displayJokeFirstContainer, false);
         } else {
            toggleElementVisibility(displayJokeSecondContainer, true);
            jokeDisplay.innerHTML = `<strong>${jokeObj.setup}</strong>`;
            displayJokeSecondContainer.innerHTML = `${jokeObj.delivery}`;
         }
      });
   } catch (error) {
      jokeDisplay.innerHTML = "Failed to fetch jokes. Please try again.";
      console.error("Error fetching jokes:", error);
   }
}

filterToggleBtn.addEventListener("click", toggleFilters);
categoryCheckboxes.forEach((cb) =>
   cb.addEventListener("change", handleCategoryChange)
);
anyCategoryCheckbox.addEventListener("change", handleAnyCategory);
newJokeBtn.addEventListener("click", fetchAndDisplayJoke);
