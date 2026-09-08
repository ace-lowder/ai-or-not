const rateLimit = (_request: Request, context: { next: () => Promise<Response> }) => context.next();

export default rateLimit;

export const config = {
  path: "/api/round",
  rateLimit: {
    windowLimit: 50,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
