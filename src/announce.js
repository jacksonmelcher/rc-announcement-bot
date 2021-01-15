import { Service, Bot } from 'ringcentral-chatbot/dist/models';

const announce = async () => {
    const [{ dataValues }] = await Bot.findAll();
    const bot = await Bot.findByPk(dataValues.id);
    let services = [];
    let sorted = [];
    services = await Service.findAll({ where: { name: 'Announce' } });

    if (services.length > 0) {
        let res = await bot.rc.get(
            `restapi/v1.0/glip/teams/${services[0].dataValues.groupId}`
        );
        console.log(res.data.description);
    } else {
        return;
    }
};

export default announce;
