import express from 'express';
import client from 'prom-client';

const app = express();

const metric = {
  http: {
    requests: {
      duration: new client.Histogram({
        name: 'request_duration_seconds',
        help: 'Request duration in seconds',
        labelNames: ['service', 'method', 'route', 'status_code'],
      }),
    },
  },
};

// Helper function to calculate the duration in seconds
const calculateDuration = (start) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e9 + diff[1]) / 1e9;
};

// Observes the request metrics
const observeRequest = (method, path, statusCode, start) => {
  const route = path.toLowerCase();
  if (route !== '/metrics' && route !== '/metrics/') {
    const duration = calculateDuration(start);
    metric.http.requests.duration.labels('front-end', method.toLowerCase(), route, statusCode).observe(duration);
  }
};

// Middleware to track request durations
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    observeRequest(req.method, req.path, res.statusCode, start);
  });

  next();
};

app.use(metricsMiddleware);

// Endpoint to expose metrics
app.get('/metrics', (req, res) => {
  res.header('content-type', 'text/plain');
  res.end(client.register.metrics());
});

export default app;
