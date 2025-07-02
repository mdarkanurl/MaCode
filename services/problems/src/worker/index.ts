import { connect, consumeData } from './RabbitMQ';

(async () => {
  await connect();
  await consumeData();
})();
