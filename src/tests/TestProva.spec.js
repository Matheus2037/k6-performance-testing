import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getUsersDuration = new Trend('get_users_duration', true);

export const rateStatusOk = new Rate('rate_status_ok');

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.25'], 
        
        get_users_duration: ['p(90)<6800'],
    },
    stages: [
      { duration: '1m', target: 7 },
      { duration: '1m', target: 92 },  
      { duration: '1m30s', target: 92 }
    ]
};

export default function () {
  const baseUrl = 'https://gorest.co.in/public/v2/users';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getUsersDuration.add(res.timings.duration);

  rateStatusOk.add(res.status === OK);

  check(res, {
    'GET Users - Status 200': () => res.status === OK
  });
}