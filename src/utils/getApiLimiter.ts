import rateLimit from "express-rate-limit";

export const getApiLimiter = () => {
  const apiLimiter = rateLimit({
    windowMs: 10000,
    max: 5, // Limit each IP to 100 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  return apiLimiter;
};

export default getApiLimiter;
