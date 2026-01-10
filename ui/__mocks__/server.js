import jsonServer from 'json-server';
import layout from './layout.json' with { type: 'json' };
import large_data_set from './large_data_set.json' with { type: 'json' };
import small_data_set from './small_data_set.json' with { type: 'json' };

const server = jsonServer.create();
const router = jsonServer.router({
  layout,
  large_data_set,
  small_data_set,
});
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);
server.listen(3000, function () {
  console.log('JSON Server is running on http://localhost:3000');
});
