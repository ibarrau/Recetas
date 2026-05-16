document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  const searchInput = document.querySelector("#recipe-search");
  const clearButton = document.querySelector("#clear-search");
  const recipeGrid = document.querySelector("#recipe-grid");
  const emptyState = document.querySelector("#search-empty");
  const searchStatus = document.querySelector("#search-status");
  const searchDataScript = document.querySelector("#recipes-search-data");

  if (!searchInput || !recipeGrid || !searchDataScript) return;

  let recipes = [];

  try {
    recipes = JSON.parse(searchDataScript.textContent);
  } catch (error) {
    console.error("No se pudo leer el índice de recetas.", error);
    return;
  }

  function normalize(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function scoreRecipe(recipe, query) {
    const q = normalize(query);
    if (!q) return 1;

    const title = normalize(recipe.title);
    const description = normalize(recipe.description);
    const category = normalize(recipe.category);
    const tags = Array.isArray(recipe.tags)
      ? normalize(recipe.tags.join(" "))
      : normalize(recipe.tags);
    const content = normalize(recipe.content);

    let score = 0;

    if (title === q) score += 200;
    if (title.startsWith(q)) score += 120;
    if (title.includes(q)) score += 80;

    if (category.includes(q)) score += 40;
    if (tags.includes(q)) score += 35;
    if (description.includes(q)) score += 25;
    if (content.includes(q)) score += 15;

    return score;
  }

  function createRecipeCard(recipe) {
    const article = document.createElement("article");
    article.className = "recipe-card card";

    const imageHtml = recipe.image
      ? `
        <a class="recipe-card__image" href="${recipe.url}">
          <img src="${recipe.image}" alt="${recipe.title}">
        </a>
      `
      : "";

    const categoryHtml = recipe.category
      ? `<span class="recipe-card__category">${recipe.category}</span>`
      : "";

    const descriptionHtml = recipe.description
      ? `<p>${recipe.description}</p>`
      : "";

    const meta = [];
    if (recipe.total_time) meta.push(`<span>⏱ ${recipe.total_time}</span>`);
    if (recipe.servings) meta.push(`<span>🍽 ${recipe.servings}</span>`);
    if (recipe.difficulty) meta.push(`<span>⭐ ${recipe.difficulty}</span>`);

    article.innerHTML = `
      ${imageHtml}
      <div class="recipe-card__content">
        ${categoryHtml}
        <h3><a href="${recipe.url}">${recipe.title}</a></h3>
        ${descriptionHtml}
        <div class="recipe-card__meta">${meta.join("")}</div>
      </div>
    `;

    return article;
  }

  function renderRecipes(filteredRecipes, query) {
    recipeGrid.innerHTML = "";

    if (!filteredRecipes.length) {
      emptyState.hidden = false;
      if (searchStatus) {
        searchStatus.textContent = `No hubo resultados para “${query}”.`;
      }
      return;
    }

    emptyState.hidden = true;

    filteredRecipes.forEach(function (recipe) {
      recipeGrid.appendChild(createRecipeCard(recipe));
    });

    if (searchStatus) {
      if (query) {
        searchStatus.textContent = `${filteredRecipes.length} resultado(s) para “${query}”.`;
      } else {
        searchStatus.textContent = "Explora las recetas del recetario.";
      }
    }
  }

  function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
      const defaultRecipes = recipes.slice().sort(function (a, b) {
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
      renderRecipes(defaultRecipes, "");
      return;
    }

    const ranked = recipes
      .map(function (recipe) {
        return {
          recipe: recipe,
          score: scoreRecipe(recipe, query)
        };
      })
      .filter(function (item) {
        return item.score > 0;
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.recipe.title.localeCompare(b.recipe.title);
      })
      .map(function (item) {
        return item.recipe;
      });

    renderRecipes(ranked, query);
  }

  searchInput.addEventListener("input", performSearch);

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      searchInput.value = "";
      performSearch();
      searchInput.focus();
    });
  }

  performSearch();
});