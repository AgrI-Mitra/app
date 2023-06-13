export const getInitialMsgs = (t: any, flags: any): any => {
  return {
    payload: {
      buttonChoices: [
        {
          key: "1",
          text:flags?.en_example_ques_one?.value ||
                "What are the different types of millets grown in Odisha?"
        },
        {
          key: "2",
          text:
            flags?.en_example_ques_two?.value ||
                "Tell me something about treatment of termites in sugarcane?"
        },
        {
          key: "3",
          text:
            flags?.en_example_ques_three?.value ||
                "How can farmers apply to government schemes in Odisha?"
        },
      ],
      text: t("label.examples"),
    },
    position: "left",
    exampleOptions: true,
  };
};
