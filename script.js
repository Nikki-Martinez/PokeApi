class AdvancedPokedex {
  constructor() {
      this.currentPage = 1;
      this.itemsPerPage = 25;
      this.selectedType = '';
      this.filteredPokemon = [];
      this.allPokemonBasic = [];
      this.typeList = [];
      this.isFiltering = false;
      
      this.initializeElements();
      this.attachEventListeners();
      this.initializeApp();
  }

  async initializeApp() {
      await Promise.all([
          this.loadPokemonList(),
          this.loadTypes()
      ]);
  }

  initializeElements() {
      this.grid = document.getElementById('pokemonGrid');
      this.searchInput = document.getElementById('searchInput');
      this.searchButton = document.getElementById('searchButton');
      this.randomButton = document.getElementById('randomButton');
      this.clearButton = document.getElementById('clearFilters');
      this.typeFilter = document.getElementById('typeFilter');
      this.itemsPerPageSelect = document.getElementById('itemsPerPage');
      this.prevButton = document.getElementById('prevButton');
      this.nextButton = document.getElementById('nextButton');
      this.pageInfo = document.getElementById('pageInfo');
      this.loadingElement = document.getElementById('loading');
      this.errorElement = document.getElementById('errorMessage');
      this.overlay = document.getElementById('overlay');
      this.detailElement = document.getElementById('pokemonDetail');
  }

  attachEventListeners() {
      this.searchButton.addEventListener('click', () => this.searchPokemon());
      this.searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.searchPokemon();
      });
      this.randomButton.addEventListener('click', () => this.randomPokemon());
      this.clearButton.addEventListener('click', () => this.clearAllFilters());
      this.typeFilter.addEventListener('change', () => this.filterByType());
      this.itemsPerPageSelect.addEventListener('change', () => this.changeItemsPerPage());
      this.prevButton.addEventListener('click', () => this.changePage(-1));
      this.nextButton.addEventListener('click', () => this.changePage(1));
      this.overlay.addEventListener('click', () => this.closeDetail());
  }

  async loadTypes() {
      try {
          const response = await fetch('https://pokeapi.co/api/v2/type');
          const data = await response.json();
          this.typeList = data.results.filter(type => 
              type.name !== 'unknown' && type.name !== 'shadow'
          );
          
          this.typeList.forEach(type => {
              const option = document.createElement('option');
              option.value = type.name;
              option.textContent = this.translateType(type.name);
              this.typeFilter.appendChild(option);
          });
      } catch (error) {
          console.error('Error loading types:', error);
      }
  }

  translateType(type) {
      const translations = {
          normal: 'Normal',
          fire: 'Fuego',
          water: 'Agua',
          electric: 'Eléctrico',
          grass: 'Planta',
          ice: 'Hielo',
          fighting: 'Lucha',
          poison: 'Veneno',
          ground: 'Tierra',
          flying: 'Volador',
          psychic: 'Psíquico',
          bug: 'Bicho',
          rock: 'Roca',
          ghost: 'Fantasma',
          dragon: 'Dragón',
          dark: 'Siniestro',
          steel: 'Acero',
          fairy: 'Hada'
      };
      return translations[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  async loadPokemonList() {
      try {
          this.showLoading(true);
          const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
          const data = await response.json();
          this.allPokemonBasic = data.results;
          this.filteredPokemon = [...this.allPokemonBasic];
      } catch (error) {
          this.showError('Error al cargar la lista de Pokémon');
      } finally {
          this.showLoading(false);
      }
  }

  async filterByType() {
      this.selectedType = this.typeFilter.value;
      
      if (!this.selectedType) {
          this.filteredPokemon = [...this.allPokemonBasic];
          this.isFiltering = false;
          this.currentPage = 1;
          await this.renderCurrentPage();
          return;
      }

      this.showLoading(true);
      try {
          const response = await fetch(`https://pokeapi.co/api/v2/type/${this.selectedType}`);
          const data = await response.json();
          
          this.filteredPokemon = data.pokemon.map(p => p.pokemon);
          this.isFiltering = true;
          this.currentPage = 1;
          await this.renderCurrentPage();
      } catch (error) {
          this.showError('Error al filtrar por tipo');
      } finally {
          this.showLoading(false);
      }
  }

  changeItemsPerPage() {
      this.itemsPerPage = parseInt(this.itemsPerPageSelect.value);
      this.currentPage = 1;
      this.renderCurrentPage();
  }

  async renderCurrentPage() {
      this.showLoading(true);
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const pagePokemon = this.filteredPokemon.slice(start, end);

      this.grid.innerHTML = '';
      
      if (pagePokemon.length === 0) {
          this.grid.innerHTML = '<div class="no-results">😕 No se encontraron Pokémon con estos filtros</div>';
          this.updatePagination();
          this.showLoading(false);
          return;
      }

      const promises = pagePokemon.map(pokemon => this.fetchPokemonData(pokemon.url));
      const pokemonDataArray = await Promise.all(promises);
      
      pokemonDataArray.forEach(pokemonData => {
          if (pokemonData) {
              this.grid.appendChild(this.createPokemonCard(pokemonData));
          }
      });

      this.updatePagination();
      this.showLoading(false);
  }

  async fetchPokemonData(url) {
      try {
          const response = await fetch(url);
          return await response.json();
      } catch (error) {
          console.error('Error fetching pokemon:', error);
          return null;
      }
  }

  createPokemonCard(pokemon) {
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      card.style.animationDelay = `${Math.random() * 0.3}s`;
      
      const primaryType = pokemon.types[0].type.name;
      card.style.background = `linear-gradient(135deg, white 60%, ${this.getTypeColor(primaryType)}20)`;
      
      card.innerHTML = `
          <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
          <div class="pokemon-image" style="background: ${this.getTypeColor(primaryType)}15;">
              <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                   alt="${pokemon.name}" loading="lazy">
          </div>
          <div class="pokemon-name">${pokemon.name}</div>
          <div class="pokemon-types">
              ${pokemon.types.map(type => 
                  `<span class="type-badge type-${type.type.name}" 
                         onclick="event.stopPropagation(); app.quickFilterByType('${type.type.name}')"
                         title="Filtrar por tipo ${this.translateType(type.type.name)}">
                      ${this.translateType(type.type.name)}
                  </span>`
              ).join('')}
          </div>
      `;

      card.addEventListener('click', () => this.showPokemonDetail(pokemon));
      return card;
  }

  getTypeColor(type) {
      const colors = {
          normal: '#A8A878',
          fire: '#F08030',
          water: '#6890F0',
          electric: '#F8D030',
          grass: '#78C850',
          ice: '#98D8D8',
          fighting: '#C03028',
          poison: '#A040A0',
          ground: '#E0C068',
          flying: '#A890F0',
          psychic: '#F85888',
          bug: '#A8B820',
          rock: '#B8A038',
          ghost: '#705898',
          dragon: '#7038F8',
          dark: '#705848',
          steel: '#B8B8D0',
          fairy: '#EE99AC'
      };
      return colors[type] || '#A8A878';
  }

  quickFilterByType(type) {
      this.typeFilter.value = type;
      this.filterByType();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showPokemonDetail(pokemon) {
      const stats = pokemon.stats.map(stat => {
          const percentage = (stat.base_stat / 255) * 100;
          return `
              <div class="stat-bar">
                  <div class="stat-name">
                      <span>${this.translateStat(stat.stat.name)}</span>
                      <span>${stat.base_stat}/255</span>
                  </div>
                  <div class="stat-bar-bg">
                      <div class="stat-fill" style="width: ${percentage}%; background: ${this.getStatColor(stat.base_stat)}"></div>
                  </div>
              </div>
          `;
      }).join('');

      const detailHTML = `
          <button class="close-button" onclick="app.closeDetail()">✕</button>
          <div class="pokemon-id" style="font-size: 1.2rem;">#${String(pokemon.id).padStart(3, '0')}</div>
          <div class="pokemon-image" style="width: 200px; height: 200px; margin: 20px auto; background: ${this.getTypeColor(pokemon.types[0].type.name)}15;">
              <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                   style="width: 180px; height: 180px;">
          </div>
          <div class="pokemon-name" style="font-size: 1.8rem;">${pokemon.name}</div>
          <div class="pokemon-types" style="margin-top: 10px;">
              ${pokemon.types.map(type => 
                  `<span class="type-badge type-${type.type.name}">${this.translateType(type.type.name)}</span>`
              ).join('')}
          </div>

          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">📏 Altura</div>
                  <div class="info-value">${pokemon.height / 10} m</div>
              </div>
              <div class="info-item">
                  <div class="info-label">⚖️ Peso</div>
                  <div class="info-value">${pokemon.weight / 10} kg</div>
              </div>
              <div class="info-item">
                  <div class="info-label">💪 Habilidades</div>
                  <div class="info-value" style="font-size: 0.9rem;">
                      ${pokemon.abilities.map(a => 
                          `<span style="display: block; text-transform: capitalize;">${a.ability.name.replace('-', ' ')}</span>`
                      ).join('')}
                  </div>
              </div>
          </div>

          <div class="stats-container">
              <h3 style="margin-bottom: 15px; color: #333;">📊 Estadísticas Base</h3>
              ${stats}
              <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 1.2rem; color: #333;">
                  Total: ${pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
              </div>
          </div>
      `;

      this.detailElement.innerHTML = detailHTML;
      this.detailElement.style.display = 'block';
      this.overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
  }

  translateStat(statName) {
      const translations = {
          'hp': 'PS',
          'attack': 'Ataque',
          'defense': 'Defensa',
          'special-attack': 'Atq. Esp.',
          'special-defense': 'Def. Esp.',
          'speed': 'Velocidad'
      };
      return translations[statName] || statName;
  }

  getStatColor(value) {
      if (value >= 150) return '#FFD700';
      if (value >= 100) return '#4CAF50';
      if (value >= 70) return '#8BC34A';
      if (value >= 50) return '#FFA500';
      return '#FF5722';
  }

  closeDetail() {
      this.detailElement.style.display = 'none';
      this.overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
  }

  async searchPokemon() {
      const searchTerm = this.searchInput.value.toLowerCase().trim();
      if (!searchTerm) {
          await this.clearAllFilters();
          return;
      }

      this.showLoading(true);
      try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
          if (!response.ok) throw new Error('Pokémon no encontrado');
          
          const pokemon = await response.json();
          this.grid.innerHTML = '';
          this.grid.appendChild(this.createPokemonCard(pokemon));
          
          this.prevButton.disabled = true;
          this.nextButton.disabled = true;
          this.pageInfo.textContent = 'Resultado de búsqueda';
      } catch (error) {
          this.showError('Pokémon no encontrado. Intenta con otro nombre o número.');
          await this.clearAllFilters();
      } finally {
          this.showLoading(false);
      }
  }

  async randomPokemon() {
      const randomId = Math.floor(Math.random() * 898) + 1;
      this.showLoading(true);
      try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
          const pokemon = await response.json();
          this.grid.innerHTML = '';
          this.grid.appendChild(this.createPokemonCard(pokemon));
          
          this.prevButton.disabled = true;
          this.nextButton.disabled = true;
          this.pageInfo.textContent = '✨ Pokémon Aleatorio';
      } catch (error) {
          this.showError('Error al cargar Pokémon aleatorio');
      } finally {
          this.showLoading(false);
      }
  }

  async clearAllFilters() {
      this.searchInput.value = '';
      this.typeFilter.value = '';
      this.selectedType = '';
      this.filteredPokemon = [...this.allPokemonBasic];
      this.isFiltering = false;
      this.currentPage = 1;
      await this.renderCurrentPage();
  }

  changePage(direction) {
      const totalPages = Math.ceil(this.filteredPokemon.length / this.itemsPerPage);
      const newPage = this.currentPage + direction;
      
      if (newPage >= 1 && newPage <= totalPages) {
          this.currentPage = newPage;
          this.renderCurrentPage();
          this.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }

  updatePagination() {
      const totalPages = Math.ceil(this.filteredPokemon.length / this.itemsPerPage);
      this.prevButton.disabled = this.currentPage === 1;
      this.nextButton.disabled = this.currentPage >= totalPages || totalPages === 0;
      this.pageInfo.textContent = totalPages > 0 
          ? `Página ${this.currentPage} de ${totalPages} (${this.filteredPokemon.length} Pokémon)`
          : 'Sin resultados';
  }

  showLoading(show) {
      this.loadingElement.style.display = show ? 'block' : 'none';
      if (show) this.errorElement.style.display = 'none';
  }

  showError(message) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
      setTimeout(() => {
          this.errorElement.style.display = 'none';
      }, 4000);
  }
}

// Inicializar la aplicación
const app = new AdvancedPokedex();