export const getInitialMsgs = (t: any, flags: any): any => {
  return {
    payload: {
      buttonChoices: [
        {
          key: '1',
          text: 'Where is my money?',
        },
        {
          key: '2',
          text: 'What is my application status?',
        },
        {
          key: '3',
          text: 'Who do I need to talk to get my money?',
        },
      ],
      text: t('label.examples'),
    },
    position: 'left',
    exampleOptions: true,
  };
};
