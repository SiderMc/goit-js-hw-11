import axios from 'axios';
const KEY = '36724062-c8c8af652756def817f91b711';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchResponse(value, page, sort) {
  const params = new URLSearchParams({
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    q: value,
    per_page: 40,
    page,
    order: sort,
  });
  const response = await axios.get(
    `${BASE_URL}?key=${KEY}&${params.toString()}`
  );
  return response.data;
}
export { fetchResponse };
