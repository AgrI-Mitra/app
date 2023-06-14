export const getInitialMsgs = (t: any, flags: any): any => {
  return {
    payload: {
      buttonChoices: [
        {
          key: '1',
          text: 'मेरा पैसा कहाँ है?',
        },
        {
          key: '2',
          text: 'मेरे आवेदन की स्थिति क्या है?',
        },
        {
          key: '3',
          text: 'अपना पैसा पाने के लिए मुझे किससे बात करने की आवश्यकता है?',
        },
      ],
      text: t('label.examples'),
    },
    position: 'left',
    exampleOptions: true,
  };
};
