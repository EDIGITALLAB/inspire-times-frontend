const isProduction = window.location.hostname !== 'localhost';

export const API_CONFIG = {
  baseUrl: isProduction ? 'https://edigitallab.com' : 'http://localhost:8081',
  apiUrl: isProduction ? 'https://edigitallab.com/inspire-api/api' : 'http://localhost:8081/api'
};
