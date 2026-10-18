const params = new URLSearchParams(window.location.search);
const x = params.get('language') || 'English';

console.log(x);
