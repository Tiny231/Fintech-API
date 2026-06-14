import axios from "axios";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

// register fintech
export const registerFintech = async ({ name, email }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;

  try {
    const payload = {
      name,
      email,
    };

    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/fintech/onboard`,
      payload, 
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to register fintech"
    );
  }
};

// module-level token store
let nibssToken = null;

export const fintechLogin = async ({ apiKey, apiSecret }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;

  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/auth/token`,
      { apiKey, apiSecret },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // save token automatically after login
    nibssToken = data.token;

    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to authenticate fintech"
    );
  }
};

// create Bvn
export const createBVN = async ({ bvn, firstName, lastName, dob, phone }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/insertBvn`,
      { bvn, firstName, lastName, dob, phone },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return data;
  } catch (error) {
    // Temporarily log full error details
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to create BVN"
    );
  }
};

// create NIN
export const createNIN = async ({ nin, firstName, lastName, dob }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/insertNin`,
      { nin, firstName, lastName, dob },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return data;
  } catch (error) {
    // Temporarily log full error details
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to create NIN"
    );
  }
};


// Create a user in NIBSS system
export const createUser = async ({ kycType, kycID, dob }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  // always get a fresh token before calling NIBSS
  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/account/create`,
      { kycType, kycID, dob },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to create user"
    );
  }
};

// validate bvn
export const validateBVN = async ({ bvn }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  // get fresh token from NIBSS
  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/validateBvn`,
      { bvn },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to validate BVN"
    );
  }
};

// validate nin
export const validateNIN = async ({ nin }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  // get fresh token from NIBSS
  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/validateNin`,
      { nin },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to validate NIN"
    );
  }
};

// NAME ENQUIRY
export const nameEnquiry = async ({ accountNumber }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  // get fresh token from NIBSS
  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.get(
      `${NIBSS_BASE_URL}/api/account/name-enquiry/${accountNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to perform name enquiry"
    );
  }
};

export const getAllAccounts = async () => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.get(`${NIBSS_BASE_URL}/api/accounts`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch accounts"
    );
  }
};

export const getAccountBalance = async ({ accountNumber }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.get(
      `${NIBSS_BASE_URL}/api/account/balance/${accountNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch account balance"
    );
  }
};

// initiate transfer
export const initiateTransfer = async ({ from, to, amount }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.post(
      `${NIBSS_BASE_URL}/api/transfer`,
      { from, to, amount },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to initiate transfer"
    );
  }
};

export const getTransactionStatus = async ({ transactionId }) => {
  const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;
  const NIBSS_API_KEY = process.env.NIBSS_API_KEY;
  const JWT_SECRET = process.env.JWT_SECRET;

  const authResponse = await fintechLogin({
    apiKey: NIBSS_API_KEY,
    apiSecret: JWT_SECRET,
  });

  const token = authResponse.token;

  try {
    const { data } = await axios.get(
      `${NIBSS_BASE_URL}/api/transaction/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("NIBSS Error:", JSON.stringify(error.response?.data, null, 2));

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch transaction status"
    );
  }
};