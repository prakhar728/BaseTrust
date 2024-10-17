
export const fetchEthereumPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );

    if (!response.ok) {
      throw new Error("Error fetching data");
    }

    const data = await response.json();
    
    return data.ethereum.inr
    
  } catch (err) {
    console.log(err);

  }
};
