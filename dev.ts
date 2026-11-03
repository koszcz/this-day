// Dev server: serves the game at http://localhost:5174 with hot reload.
import index from './index.html';

const server = Bun.serve({
  port: Number(process.env.PORT) || 5174,
  routes: { '/': index },
  development: true,
});
console.log(`This Day is running at ${server.url}`);
