const axios = require('axios');

export default async function handler(req, res) {
  const { endPoint, method,  data } = req.body;
  try {
      let config = {
        method: method,
        maxBodyLength: Infinity,
        url: `${process.env.PM_KISAN_BASE_URL}/${endPoint}`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      let response = await axios.request(config)
      res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}
