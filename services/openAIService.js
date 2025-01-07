import { Configuration, OpenAIApi } from "openai";

export const getOpenAI = async (req, res) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "user",
          content:
            "Can provide me a summary of Chromophobe Renal Cell Carcinoma in 50-100?",
        },
      ],
      // return_metadata: true,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch AI");
  }
};
