import './css/styles.css';
import { Notify } from "notiflix";
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31301300-300be7510f84e8e4ecf9762e9';
const PIC_PER_PAGE = 40;
const SAFESEARCH = 'true';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';

const formEl = document.querySelector('#search-form')
const inputEl = document.querySelector('[name="searchQuery"]');
const submitBtn = document.querySelector('[type="submit"]');
const loadBtn = document.querySelector('[type="button"]');
const galleryEl = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });



let page = 1;
let request = '';

submitBtn.addEventListener('click', onSubmit);
loadBtn.addEventListener('click', onLoadMore);


function onSubmit(event) {
    event.preventDefault();
    page = 1;
    request = inputEl.value;

    if (request === '') {
        Notify.info('What exactly do we search?');
        hideLoadBtn();
        
    } else {
        showResult()
        formEl.reset();
    }
}

function onLoadMore() {
    page += 1;
    showResult();
    
}

async function fetchPics() {

        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: request,
                image_type: IMAGE_TYPE,
                page: page,
                per_page: PIC_PER_PAGE,
                safesearch: SAFESEARCH,
                orientation: ORIENTATION
            }
        })
        const data = response.data;
        return data;
}


async function showResult() {
    try {
        const data = await fetchPics();
        const resultEl = await renderMarkup(data);
        galleryEl.insertAdjacentHTML('beforeend', resultEl);
        lightbox.refresh();
     
    } catch (error) {
        Notify.failure('Oops, something went wrong! We are working hard to fix it!');
    }    
}


function renderMarkup(data) {
        let { hits, total, totalHits } = data;
        if (page > 1) {
            showLoadmoreNotify(hits.length);
        } else {
            showSubmitNotify(totalHits, hits.length);
            clearResultField();
        }

        const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
            
            
            <div class="photo-card">
                <div class="thumb"><a class="gallery__item" href="${largeImageURL}">
                    <img class="gallery__image"src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
                </div>
                <div class="info">
                    <p class="info-item">
                        <svg class="gallery__icon" xmlns="http://www.w3.org/2000/svg" id="Icons"  width="32" height="32" viewBox="0 0 24 24"><defs></defs><title>Likes</title><path class="cls-1" d="M12,22c8-4,11-9,11-14A6,6,0,0,0,12,4.686,6,6,0,0,0,1,8C1,13,4,18,12,22Z"/></svg>
                        <b>${likes}</b>
                    </p>
                    <p class="info-item">
                        <svg class="gallery__icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 576 512"><title>Views</title><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"/></svg>
                        <b>${views}</b>
                        </p>
                    <p class="info-item">
                        <svg class="gallery__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="enable-background:new 0 0 24 24;" version="1.1" width="32" height="32" viewBox="0 0 24 24" xml:space="preserve"><g id="info"/><g id="icons"> <title>Comments</title><path d="M20,1H4C1.8,1,0,2.8,0,5v10c0,2.2,1.8,4,4,4v3c0,0.9,1.1,1.3,1.7,0.7L9.4,19H20c2.2,0,4-1.8,4-4V5   C24,2.8,22.2,1,20,1z M14,13H8c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1C15,12.6,14.6,13,14,13z M16,9H8   C7.4,9,7,8.6,7,8c0-0.6,0.4-1,1-1h8c0.6,0,1,0.4,1,1C17,8.6,16.6,9,16,9z" id="message"/></g></svg>
                        <b>${comments}</b>
                    </p>
                    <p class="info-item">
                        <svg class="gallery__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons" style="enable-background:new 0 0 32 32;" version="1.1" width="32" height="32" viewBox="0 0 32 32" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} </style><polyline class="st0" points="20,17 16,21 12,17 "/><line class="st0" x1="16" x2="16" y1="21" y2="10"/><title>Downloads</title> <path class="st0" d="M21,29H11c-4.4,0-8-3.6-8-8V11c0-4.4,3.6-8,8-8h10c4.4,0,8,3.6,8,8v10C29,25.4,25.4,29,21,29z"/></svg>
                        <b>${downloads}</b>
                    </p>
                </div>
            </div>
                `).join("");
        return markup;
    }

function clearResultField() {
    galleryEl.innerHTML = "";
}

function showLoadBtn() {
    loadBtn.classList.remove("visually-hidden")
}

function hideLoadBtn() {
    loadBtn.classList.add("visually-hidden");
}

function showSubmitNotify(totalHits, arrLength) {
    if (arrLength === 0) {
        hideLoadBtn();
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        
    } else {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        showLoadBtn()
    }
}

function showLoadmoreNotify(arrLength) {
    if (arrLength < PIC_PER_PAGE) {
        hideLoadBtn();
        Notify.warning("We're sorry, but you've reached the end of search results.");
    }
}