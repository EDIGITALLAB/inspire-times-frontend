const isProduction = window.location.hostname !== 'localhost';

export const API_CONFIG = {
  baseUrl: isProduction ? 'https://inspiretimes.in' : 'http://localhost:8081',
  apiUrl: isProduction ? 'https://inspiretimes.in/api' : 'http://localhost:8081/api'
};
