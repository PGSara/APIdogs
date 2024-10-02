const breedUrl = 'https://api.thedogapi.com/v1/breeds';
const searchUrl = 'https://api.thedogapi.com/v1/images/search?limit=10&breed_ids=';
let currentPage = 1; 
let loading = false;
let favorites = JSON.parse(localStorage.getItem('favoritos')) || [];

// Função para buscar raças
async function carregarRacas() {
    try {
        const response = await fetch(breedUrl);
        const raças = await response.json();
        const raçaSelect = document.getElementById('raçaSelect');

        raças.forEach(raça => {
            const option = document.createElement('option');
            option.value = raça.id;
            option.textContent = raça.name;
            raçaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar raças:', error);
    }
}

// Função para exibir imagens de cães
function exibirDogs(dogs) {
    const dogsContainer = document.getElementById('dogsContainer');
    dogsContainer.innerHTML = '';

    if (dogs.length > 0) {
        dogs.forEach(dog => {
            const item = document.createElement('div');
            item.classList.add('dog-item');
            
            // Verifica se a raça existe e se há informações suficientes
            const breedName = dog.breeds && dog.breeds.length > 0 ? dog.breeds[0].name : 'Raça desconhecida';

            item.innerHTML = `
                <img src="${dog.url}" alt="Imagem de cachorro">
                <button class="favorite-btn">❤️ Favoritar</button>
                <div class="details">Raça: ${breedName}</div>
            `;

            // Evento para adicionar aos favoritos
            item.querySelector('.favorite-btn').addEventListener('click', () => {
                favoritarDog(dog);
            });

            dogsContainer.appendChild(item);
        });
    } else {
        dogsContainer.innerHTML = '<p>Nenhuma imagem encontrada.</p>';
    }
}

// Função para favoritar um cão
function favoritarDog(dog) {
    if (favorites.find(fav => fav.id === dog.id)) {
        alert("Este cão já está nos favoritos!");
    } else {
        favorites.push(dog);
        localStorage.setItem('favoritos', JSON.stringify(favorites));
        alert("Cão adicionado aos favoritos!");
    }
}

// Função para exibir favoritos
function exibirFavoritos() {
    const favoritosList = document.getElementById('favoritosList');
    favoritosList.innerHTML = '';

    if (favorites.length === 0) {
        favoritosList.innerHTML = '<p>Nenhum cão favoritado.</p>';
        return;
    }

    favorites.forEach(fav => {
        const item = document.createElement('div');
        item.classList.add('favorite-item');
        item.innerHTML = `
            <img src="${fav.url}" alt="Imagem de cachorro">
            <h3>${fav.breeds[0]?.name || 'Raça desconhecida'}</h3>
            <button class="remove-fav-btn">❌ Remover</button>
        `;

        item.querySelector('.remove-fav-btn').addEventListener('click', () => {
            removerFavorito(fav);
        });

        favoritosList.appendChild(item);
    });
}

// Função para remover um favorito
function removerFavorito(dog) {
    favorites = favorites.filter(fav => fav.id !== dog.id);
    localStorage.setItem('favoritos', JSON.stringify(favorites));
    exibirFavoritos();
    alert("Cão removido dos favoritos.");
}

// Função para carregar mais cães ao rolar a página
async function carregarMaisDogs() {
    const raçaId = document.getElementById('raçaSelect').value;
    if (!raçaId) return;

    try {
        const response = await fetch(`${searchUrl}${raçaId}&page=${currentPage}`);
        const dogs = await response.json();
        exibirDogs(dogs);
        currentPage++;
    } catch (error) {
        console.error('Erro ao carregar mais cães:', error);
    }
}

// Função de scroll para carregar mais cães
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !loading) {
        carregarMaisDogs();
    }
});

// Função para limpar o filtro
function limparFiltro() {
    const dogsContainer = document.getElementById('dogsContainer');
    dogsContainer.innerHTML = '';
    currentPage = 1; 
    carregarMaisDogs(); 
}

// Inicializa a página e os eventos
document.addEventListener('DOMContentLoaded', () => {
    carregarRacas();
    document.getElementById('fetchDog').addEventListener('click', carregarMaisDogs);
    document.getElementById('exibirFavoritos').addEventListener('click', exibirFavoritos);
    document.getElementById('limparFiltro').addEventListener('click', limparFiltro);
});
