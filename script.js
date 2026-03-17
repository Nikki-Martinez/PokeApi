const container = document.querySelector('.container-cards');
const selectPageSize = document.getElementById('page-size');

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

// Función para crear y renderizar una card
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

    <p class="pokemon-name">${pokemon.name}</p>

    <div class="stats">
      <p class="pokemon-weight">Peso: ${pokemon.weight}hg</p>
      <p class="pokemon-height">Altura: ${pokemon.height}dm</p>
      <p class="pokemon-type">Tipo: ${pokemon.type}</p>
    </div>
  `;

  container.appendChild(card);
}


// Función principal para traer y mostrar varios Pokémon
async function loadPokemons(limit) {

  for (let i = 1; i <= limit; i++) {

    const pokemon = await getPokemon(i);

    if (pokemon) {
      createCard(pokemon);
    }

  }

}


// evento cuando cambia el select
selectPageSize.addEventListener('change', function () {

  const newPageSize = parseInt(this.value);

  container.innerHTML = '';

  loadPokemons(newPageSize);

});


// primera carga de la página
const initialPageSize = parseInt(selectPageSize.value);

loadPokemons(initialPageSize);