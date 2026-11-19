const API_KEY = import.meta.env.VITE_OMDB_KEY;
const WATCHLIST_URL = 'http://localhost:3000/watchlist';

const titleInput = document.getElementById('titleInput');
const searchBtn  = document.getElementById('searchBtn');
const statusEl   = document.getElementById('status');
const resultEl   = document.getElementById('result');
const titleYear  = document.getElementById('titleYear');
const ratingEl   = document.getElementById('rating');
const plotEl     = document.getElementById('plot');
const watchBtn   = document.getElementById('watchBtn');

let currentMovie = null;

// GET: поиск фильма
async function searchMovie() {
  const title = titleInput.value.trim();

  if (!API_KEY) {
    statusEl.textContent = 'Ошибка: API-ключ не найден (проверьте файл .env)';
    return;
  }
  if (!title) {
    statusEl.textContent = 'Введите название фильма';
    return;
  }

  statusEl.textContent = 'Загрузка...';
  resultEl.hidden = true;
  currentMovie = null;          // сбрасываем старый результат
  searchBtn.disabled = true;    // защита от повторных кликов

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error);
    }

    currentMovie = data;
    titleYear.textContent = `${data.Title} (${data.Year})`;
    ratingEl.textContent  = `Rating: ${data.imdbRating !== 'N/A' ? data.imdbRating : 'нет данных'}`;
    plotEl.textContent    = data.Plot;

    resultEl.hidden = false;
    statusEl.textContent = '';
  } catch (error) {
    statusEl.textContent = `Ошибка: ${error.message}`;
  } finally {
    searchBtn.disabled = false;
  }
}

// POST: mock "Add to Watchlist"
async function addToWatchlist() {
  if (!currentMovie) return;

  const movieData = {
    title: currentMovie.Title,
    year: currentMovie.Year,
    rating: currentMovie.imdbRating
  };

  watchBtn.disabled = true;

  try {
    const response = await fetch(WATCHLIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    statusEl.textContent = `"${currentMovie.Title}" добавлен в Watchlist`;
  } catch (error) {
    statusEl.textContent = `Не удалось сохранить: ${error.message}`;
  } finally {
    watchBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', searchMovie);
titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchMovie();   // поиск по Enter
});
watchBtn.addEventListener('click', addToWatchlist);