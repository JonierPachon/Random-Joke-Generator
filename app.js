// get the categories
const checkboxes = document.querySelectorAll('input[name="category"]');

// we get the container of the first joke
let displayJokeFirstContainer = document.querySelector(
  ".display-joke__joke-first-part"
);

// animation of loading
let displayLoading = document.querySelector(".display-joke__loading");

// Here we display the single joke
const jokeDisplay = document.querySelector("#joke");

// we get the second container for the joke
let displayJokeSecondContainer = document.querySelector(
  ".display-joke__joke-two-parts"
);

// show or hide an element with the class close
function toggleElementVisibility(element, show) {
  // toggle + true = Do the action of adding the class
  // toggle + false = DOn't do action of adding the class
  element.classList.toggle(`${element.classList[0]}-close`, !show);
}

// 🔓
let displayFilters = document.querySelector(".filters");

// When the user clicks "Filters": 1. If filters are shown, hide the joke containers. 2. If filters are closed, show the jokes if they were already displayed.
function toggleButtonFilters() {
  displayFilters.classList.toggle("filters-close");

  //   If filters are hidden.
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

// When the user doesn't have any category selected, Any is automatically selected
let countCategories = 0;
function noneCategorySelected(selectElement) {
  // If a category is selected uncheck Any
  if (selectElement.checked) {
    countCategories++;
    document.querySelector("#any-joke").checked = false;
  } else {
    countCategories--;
  }
  // If there is no category selected, check Any
  if (countCategories === 0) {
    document.querySelector("#any-joke").checked = true;
  }
}

// Uncheck all the categories when Any is checked

function checkboxAnyBeingSelected(selectElement) {
  if (selectElement.checked) {
    checkboxes.forEach((option) => {
      option.checked = false;
    });
    countCategories = 0;
  } else {
    if (countCategories === 0) {
      document.querySelector("#any-joke").checked = true;
    }
  }
}

// ----------------------------------------------------------------------------------

// To show the joke to the user
document
  .querySelector(".display-joke__button")
  .addEventListener("click", async () => {
    //
    toggleElementVisibility(displayFilters, false);
    toggleElementVisibility(displayJokeSecondContainer, false);

    //  These three show the loading animation
    jokeDisplay.innerHTML = "";
    toggleElementVisibility(displayJokeFirstContainer, true);
    toggleElementVisibility(displayLoading, true);

    //   Everything below is focused on constructing the URL needed to retrieve the joke that the user wants

    let urlApiJoke = "https://v2.jokeapi.dev/joke/";

    // To get the category of the user's joke
    const selectedCategories = [...checkboxes]
      .filter((option) => option.checked)
      .map((option) => option.value);

    urlApiJoke += selectedCategories.length
      ? selectedCategories.join(",")
      : "Any";
    //  To keep in mind:
    //  [...checkboxes]	Converts the NodeList (which is not a real array) into a real array, so we can use .filter() and .map().
    //  .filter(...)	Keeps only the checkboxes that are checked.
    //  .map(...)	Turns each checkbox into just its value (e.g., "Programming") — creates a clean array of selected category names.
    //  .join(",")	Combines the values into a string with commas: "Programming,Pun"
    //  ? :	A ternary operator: if there are selected categories, use them; if not, use "Any".

    //
    // Jokes that the user doesn't want, blacklist
    const flags = [
      ...document.querySelectorAll('input[Type="checkbox"][name^="option"]'),
    ]
      .filter((flag) => flag.checked)
      .map((flag) => flag.value);
    if (flags.length) {
      urlApiJoke += `?blacklistFlags=${flags.join(",")}`;
    }

    try {
      const response = await fetch(urlApiJoke);
      const data = await response.json();

      // Handle multiple Objects
      const jokes = data.jokes || [data]; // fallback in case only one joke comes back

      jokes.forEach((jokeObj) => {
        if (jokeObj.type === "single") {
          // displayJokeSecondContainer.innerHTML = ""; here is important because when toggleButtonFilters hides the joke filters, it will cause the containers to display content that is different from this: "";
          displayJokeSecondContainer.innerHTML = "";
          toggleElementVisibility(displayLoading, false);
          jokeDisplay.textContent = jokeObj.joke;
          toggleElementVisibility(displayJokeSecondContainer, false);
        } else {
          toggleElementVisibility(displayLoading, false);
          // To Show the second part of the joke
          toggleElementVisibility(displayJokeSecondContainer, true);
          jokeDisplay.innerHTML = `<strong>${jokeObj.setup}</strong>`;
          displayJokeSecondContainer.innerHTML = `${jokeObj.delivery}`;
        }
      });
    } catch (error) {
      jokeDisplay.innerHTML = "Failed to fetch jokes. Please try again.";
      console.error("Error fetching jokes:", error);
    }
  });
