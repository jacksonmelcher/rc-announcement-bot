import axios from 'axios';
import createApp from 'ringcentral-chatbot/dist/apps';
import { eventHandler } from './eventHandler';
import announce from './announce';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('INDEX');

const handle = async (event) => {
    await eventHandler(event);
};

const app = createApp(handle);

app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));

setInterval(
    () => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`),
    86400000
);

logger.info('Starting loop.');
// setInterval(() => announce(), 5000);
