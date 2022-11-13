// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '4f485a4e424f46acac54e455308953ab';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(category = 'general', country = 'ru', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everithing(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

//Elements 
const form = document.forms['newsControls'];
const categorySelect = form.elements['category'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search']; 

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

//load News function
function loadNews() {
  showLoader();
  const category = categorySelect.value;
  const country = countrySelect.value;
  const searchText = searchInput.value;
  
  if (!searchText) {
    newsService.topHeadlines(category, country, onGetResponse);
  } else {
    newsService.everithing(searchText, onGetResponse);
  }
}

//function on get response frome server
function onGetResponse(err, res) {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  if (!res.articles.length) {
    showAlert('Ничего не найдено', 'error-msg');
    return;
  }
  renderNews(res.articles);
}

 //function renderNews

 function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';

  news.forEach(newsItem => {
    const element = newsTemplate(newsItem);
    fragment += element;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
 }

 // function clear container
 function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.remove(child);
    child = container.lastElementChild;
  }
 }

 //newsItem template function
function newsTemplate({ urlToImage, title, url, description }) {
/*   if (urlToImage.includes('meduza.io')) {
    urlToImage = 'https://youhavearight.ru/wp-content/uploads/2018/03/TIP-novosti-zaglushka-1-2.png';
  } */
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || 'https://youhavearight.ru/wp-content/uploads/2018/03/TIP-novosti-zaglushka-1-2.png'}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Читать далее</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

//preloader
function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
    `,
  );
}

//remove loader function
function removeLoader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  };
}
