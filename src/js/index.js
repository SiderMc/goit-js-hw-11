import '../css/style.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { refs } from './refs';
import { fetchResponse } from './fetchImages';
import { markupCards } from './markup';

Notify.init({
  useIcon: false,
  cssAnimationStyle: 'from-top',
  borderRadius: '10px',
  width: 'auto',
  className: 'notify__allert',
  distance: '0',
  position: 'center-top',
  fontSize: 'auto',
});

refs.form.addEventListener('submit', renderingList);

let page = 1;
let searchQuery = '';

function renderingList(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notify.failure('Field should not be empty');
    return;
  }

  clearGallery();
  page = 1;
  response(searchQuery, page);
  e.currentTarget.reset();
}
async function response(value, page, order) {
  try {
    const data = await fetchResponse(value, page, order);

    if (data.hits.length !== 0) {
      if (page === 1) {
        clearGallery();
        refs.headerSearch.classList.add('open');
        const { hits, totalHits } = data;
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          hits.map(markupCards).join('')
        );
        initLightbox();
        Notify.success(`Hooray! We found ${totalHits} images`);
      } else {
        const { hits } = data;
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          hits.map(markupCards).join('')
        );
        initLightbox();
      }

      const totalPages = Math.ceil(data.totalHits / 40);
      if (page === totalPages) {
        removeLoadMoreButton();
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        showLoadMoreButton();
      }
    } else {
      clearGallery();
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}

function clearGallery() {
  refs.gallery.innerHTML = '';
  removeLoadMoreButton();
}

function showLoadMoreButton() {
  if (!document.querySelector('.load-more')) {
    const buttonHTML = `<button type="button" class="load-more">Load more</button>`;
    refs.loadMoreWrapper.insertAdjacentHTML('beforeend', buttonHTML);
    const loadMoreButton = document.querySelector('.load-more');
    loadMoreButton.addEventListener('click', loadMoreImages);
  }
}

function removeLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  if (loadMoreButton) {
    loadMoreButton.removeEventListener('click', loadMoreImages);
    loadMoreButton.remove();
  }
}

function loadMoreImages() {
  page += 1;
  response(searchQuery, page);
  removeLoadMoreButton();
}

function initLightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
    overlayOpacity: 1,
    captionsData: 'alt',
    disableScroll: false,
  });

  lightbox.refresh();
}

//=====================================================
let prevButton = null;
function filter(e) {
  if (prevButton) {
    prevButton.disabled = false;
  }
  prevButton = e.target;
  e.target.disabled = true;
  clearGallery();
  const order = e.target.id;
  response(searchQuery, page, order);
}

refs.filteGallary.addEventListener('change', filter);
refs.toggle.addEventListener('click', () => {
  refs.sort.classList.toggle('active');
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const header = document.querySelector('.search__header');
      if (document.querySelector('.photo-card')) {
        if (entry.boundingClientRect.y < 0) {
          header.classList.add('observer');
        } else {
          header.classList.remove('observer');
        }
      }
    });
  },
  { root: null, rootMargin: '0px', threshold: 1 }
);
observer.observe(refs.guard);
