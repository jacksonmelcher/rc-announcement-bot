import axios from 'axios';
import createApp from 'ringcentral-chatbot/dist/apps';

import { eventHandler } from './eventHandler';
import announce from './announce';

const handle = async (event) => {
    await eventHandler(event);
};

//  ONE WEEK
// setInterval(() => remind(), 604800000);
// setInterval(() => announce(), 5000);

const app = createApp(handle);

app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));

setInterval(
    () => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`),
    86400000
);
