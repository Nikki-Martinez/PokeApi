const container = document.querySelector('.container-cards');
const selectPageSize = document.getElementById('page-size');

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageNumber = document.getElementById('page-number');

let currentPage = 1;
let pageSize = parseInt(selectPageSize.value);

// Función para traer datos de un Pokémon por su ID
async function getPokemon(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      type: data.types.map(t => t.type.name).join(', '),
      weight: data.weight,
      height: data.height,
      image: data.sprites.front_default
    };

  } catch (error) {
    console.error('Error al traer Pokémon:', error);
  }
}

// Crear card
function createCard(pokemon) {
  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <p class="pokemon-id">ID: ${pokemon.id}</p>

    <div class="image-container">
      <img class="pokemon-image"
        src="${pokemon.image}"
        alt="${pokemon.name}"
        title="${pokemon.name}">
    </div>

    <p id="pokemon-name">${pokemon.name}</p>

    <div class="stats">
      <p class="pokemon-weight">Peso: ${pokemon.weight}hg</p>
      <p class="pokemon-height">Altura: ${pokemon.height}dm</p>
      <p class="pokemon-type">Tipo: ${pokemon.type}</p>
    </div>
  `;

  container.appendChild(card);
}

// Cargar pokémons con paginación
async function loadPokemons(page, pageSize) {

  container.innerHTML = '';

  const start = (page - 1) * pageSize + 1;
  const end = page * pageSize;

  const promises = [];

  for (let i = start; i <= end; i++) {
    promises.push(getPokemon(i));
  }

  const pokemons = await Promise.all(promises);

  pokemons.forEach(pokemon => {
    if (pokemon) createCard(pokemon);
  });

}

// Botón siguiente
nextBtn.addEventListener('click', () => {
  currentPage++;
  pageNumber.textContent = currentPage;
  loadPokemons(currentPage, pageSize);
});

// Botón anterior
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    pageNumber.textContent = currentPage;
    loadPokemons(currentPage, pageSize);
  }
});

// Cambio de cantidad por página
selectPageSize.addEventListener('change', function () {

  pageSize = parseInt(this.value);
  currentPage = 1;

  pageNumber.textContent = currentPage;

  loadPokemons(currentPage, pageSize);

});

// Primera carga
loadPokemons(currentPage, pageSize);