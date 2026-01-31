import axios from 'axios';

export const predictApi = async (
  text,
  setLoading,
  setBaselineData,
  setCotegData,
) => {
  if (!text.trim()) return;
  setLoading(true);
  try {
    // const response = await axios.post('http://127.0.0.1:8000/api/predict/', { text: text });

    const response = await axios.post('https://linukarivirihan-backend.hf.space/api/predict/', { text: text });

    setBaselineData(response.data.baseline);
    setCotegData(response.data.coteg);
  } catch (error) {
    console.error('Prediction failed:', error);
    alert('Backend server error. Ensure Django is running.');
  }
  setLoading(false);
};
