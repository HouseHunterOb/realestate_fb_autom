const handleError = (res, error) => {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  };
  
  module.exports = { handleError };
  