export const helpText = {
    attachments: [
        {
            type: 'Card',
            title: 'Help 🆘',
            text: 'Here is a list of available commands and an example:',
            fields: [
                {
                    title: 'Create a reminder',
                    value:
                        '@Remind **-t** MM/DD/YYYY hh:mm am/pm **-m** Your reminder message',
                    style: 'Long',
                },
                {
                    title: 'For help',
                    value: '@Remind **help**',
                    style: 'Short',
                },
                {
                    title: 'To submit a bug/issue',
                    value: '@Remind **issue**',
                    style: 'Short',
                },
            ],
            footnote: {
                text: 'Created and maintained by RC on RC',
            },
        },
    ],
};
