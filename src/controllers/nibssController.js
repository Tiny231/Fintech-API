import { registerFintech , 
    createBVN, 
    createUser,
    fintechLogin,
    createNIN,
    validateBVN,
    validateNIN,
    nameEnquiry,
    getAllAccounts,
    getAccountBalance,
    initiateTransfer, 
    getTransactionStatus
 } from "../services/nibssService.js";
 import Transaction from "../models/TransactionModel.js";
import BVN from "../models/bvn.js";
import User from "../models/userModel.js";
import NIN from "../models/NIN.js";
import Fintech from "../models/fintechModel.js";

// Create a fintech in NIBSS system
export const registerFintechController = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name and email are required",
      });
    }

    // save fintech to MongoDB before calling NIBSS to get bankCode and bankName
    const fintech = await Fintech.create({
      name,
      email,
    });

    // call nibss service to register fintech
    const response = await registerFintech({
      name,
      email,
    });

   

    return res.status(200).json({
      success: true,
      message: "Fintech registered successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// finTech Login / Authenticate / token generation
export const fintechLoginController = async (req, res) => {
  try {
    const apiKey = process.env.NIBSS_API_KEY;
    const apiSecret = process.env.JWT_SECRET;

    // Validate that API key and secret are configured
    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: "API key and secret are not configured",
      });
    }

    // call nibss service to authenticate fintech and get token
    const nibssResponse = await fintechLogin({ apiKey, apiSecret });

     // Extract token, save everything else
    const { token, fintech } = nibssResponse;

    // Update existing fintech record in MongoDB
    await Fintech.findOneAndUpdate(
      { email: fintech.email },
      {
        bankCode: fintech.bankCode,
        bankName: fintech.bankName,
      },
      { new: true, upsert: true }
    );


    return res.status(200).json({
      success: true,
      message: "Fintech authenticated successfully",
      data: nibssResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a BVN in NIBSS system and save to MongoDB
export const createBVNController = async (req, res) => {
  try {
    const { firstName, lastName, dob, phone } = req.body;

    if (!firstName || !lastName || !dob || !phone) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, dob, and phone are required",
      });
    }

    // Generate random 11-digit BVN
    const bvn = Math.floor(10000000000 + Math.random() * 90000000000).toString();

    // Call NIBSS service to create BVN
    const nibssResponse = await createBVN({ bvn, firstName, lastName, dob, phone });

     // Save to MongoDB
    const bvnRecord = await BVN.create({
      bvn,
      firstName,
      lastName,
      dob,
      phone,
    });

    return res.status(200).json({
      data: nibssResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a NIN in NIBSS system and save to MongoDB
export const createNINController = async (req, res) => {
  try {
    const { firstName, lastName, dob } = req.body;

    if (!firstName || !lastName || !dob) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, and dob are required",
      });
    }

    // Generate random 11-digit NIN
    const nin = Math.floor(10000000000 + Math.random() * 90000000000).toString();

    // Call NIBSS service to create NIN
    const nibssResponse = await createNIN({ nin, firstName, lastName, dob });

     // Save to MongoDB
    const ninRecord = await NIN.create({
      nin,
      firstName,
      lastName,
      dob,
    });

    return res.status(200).json({
      data: nibssResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a user in NIBSS system and save to MongoDB
export const createUserController = async (req, res) => {
  try {
    let { kycType, kycID, dob } = req.body;

    if (!kycType || !kycID || !dob) {
      return res.status(400).json({
        success: false,
        message: "kycType, kycID, and dob are required",
      });
    }

     // Convert to lowercase to handle 'BVN', 'NIN', 'Bvn', etc.
    kycType = kycType.toLowerCase(); 

    // Validate kycType
    if (!["bvn", "nin"].includes(kycType)) {
      return res.status(400).json({
        success: false,
        message: "kycType must be either bvn or nin",
      });
    }

    // Validate kycID length
    if (kycID.length !== 11) {
      return res.status(400).json({
        success: false,
        message: `${kycType} must be 11 digits`,
      });
    }

    // Find matching BVN or NIN record
    let kycRecord = null;

    if (kycType === "bvn") {
      kycRecord = await BVN.findOne({ bvn: kycID });
      if (!kycRecord) {
        return res.status(404).json({
          success: false,
          message: "BVN not found, please create a BVN first",
        });
      }
    } else if (kycType === "nin") {
      kycRecord = await NIN.findOne({ nin: kycID });
      if (!kycRecord) {
        return res.status(404).json({
          success: false,
          message: "NIN not found, please create a NIN first",
        });
      }
    }

    // Call NIBSS API
    const nibssResponse = await createUser({ kycType, kycID, dob });

    // Save user to MongoDB
    const user = await User.create({
      kycType,
      kycID,
      dob,
      nibssResponse,
      bvn: kycType === "bvn" ? kycRecord._id : null,
      nin: kycType === "nin" ? kycRecord._id : null,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Validate BVN
export const validateBVNController = async (req, res) => {
  try {
    const { bvn } = req.body;

    if (!bvn) {
      return res.status(400).json({
        success: false,
        message: "bvn is required",
      });
    }

    if (bvn.length !== 11) {
      return res.status(400).json({
        success: false,
        message: "BVN must be 11 digits",
      });
    }

    const nibssResponse = await validateBVN({ bvn });

    if (!nibssResponse.success) {
      return res.status(400).json({
        success: false,
        message: "BVN is invalid",
        data: nibssResponse,
      });
    }

    return res.status(200).json({
      success: true,
      message: "BVN is valid",
      data: nibssResponse.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Validate NIN
export const validateNINController = async (req, res) => {
  try {
    const { nin } = req.body;

    if (!nin) {
      return res.status(400).json({
        success: false,
        message: "nin is required",
      });
    }

    if (nin.length !== 11) {
      return res.status(400).json({
        success: false,
        message: "NIN must be 11 digits",
      });
    }

    const nibssResponse = await validateNIN({ nin });

    if (!nibssResponse.response) {
      return res.status(400).json({
        success: false,
        message: "NIN is invalid",
        data: nibssResponse,
      });
    }

    return res.status(200).json({
      success: true,
      message: "NIN is valid",
      data: nibssResponse.response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Name Enquiry Controller
export const nameEnquiryController = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "accountNumber is required",
      });
    }

    const nibssResponse = await nameEnquiry({ accountNumber });

    return res.status(200).json({
      success: true,
      message: "Name enquiry successful",
      data: nibssResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Accounts Controller
export const getAllAccountsController = async (req, res) => {
  try {
    const nibssResponse = await getAllAccounts();

    return res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: nibssResponse.accounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAccountBalanceController = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "accountNumber is required",
      });
    }

    const nibssResponse = await getAccountBalance({ accountNumber });

    return res.status(200).json({
      success: true,
      message: "Account balance fetched successfully",
      data: nibssResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Initiate Transfer Controller
export const initiateTransferController = async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    // Step 1 — Validate request body
    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        message: "from, to, and amount are required",
      });
    }

    if (from === to) {
      return res.status(400).json({
        success: false,
        message: "Sender and recipient account numbers cannot be the same",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Step 2 — Find sender on NIBSS via name enquiry
    const senderEnquiry = await nameEnquiry({ accountNumber: from });
    if (!senderEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Sender account not found on NIBSS",
      });
    }

    // Step 3 — Find recipient on NIBSS via name enquiry
    const recipientEnquiry = await nameEnquiry({ accountNumber: to });
    if (!recipientEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Recipient account not found on NIBSS",
      });
    }

    // Step 4 — Find sender in your DB to get kycType and kycID
    const sender = await User.findOne({
      "nibssResponse.account.accountNumber": from,
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found in database",
      });
    }

    // Step 5 — Validate sender identity (BVN or NIN)
    if (sender.kycType === "bvn") {
      const bvnValidation = await validateBVN({ bvn: sender.kycID });
      if (!bvnValidation.success) {
        return res.status(400).json({
          success: false,
          message: "Sender BVN validation failed, transfer not initiated",
        });
      }
    } else if (sender.kycType === "nin") {
      const ninValidation = await validateNIN({ nin: sender.kycID });
      if (!ninValidation.response) {
        return res.status(400).json({
          success: false,
          message: "Sender NIN validation failed, transfer not initiated",
        });
      }
    }

    // Step 6 — Check sender balance
    const balanceResponse = await getAccountBalance({ accountNumber: from });
    if (!balanceResponse || balanceResponse.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds, transfer not initiated",
        data: {
          availableBalance: balanceResponse?.balance || 0,
          requiredAmount: amount,
        },
      });
    }

    // Step 7 — Initiate transfer via NIBSS
    const nibssResponse = await initiateTransfer({ from, to, amount });

    // Step 8 — Save transaction to MongoDB
    const transaction = await Transaction.create({
      transactionId: nibssResponse.reference,
      from,
      to,
      amount,
      status: nibssResponse.status,
      type: "EXTERNAL",
      nibssResponse,
    });

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      data: {
        transaction,
        sender: {
          accountNumber: senderEnquiry.accountNumber,
          accountName: senderEnquiry.accountName,
          bankName: senderEnquiry.bankName,
        },
        recipient: {
          accountNumber: recipientEnquiry.accountNumber,
          accountName: recipientEnquiry.accountName,
          bankName: recipientEnquiry.bankName,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactionStatusController = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "transactionId is required",
      });
    }

    // Step 1 — Query NIBSS for transaction status
    const nibssResponse = await getTransactionStatus({ transactionId });

    // Step 2 — Update transaction status in your MongoDB
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId },
      { status: nibssResponse.status },
      { returnDocument: 'after', upsert: true } 
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found in database",
      });
    }

   return res.status(200).json({
  success: true,
  message: "Transaction status fetched successfully",
  data: nibssResponse,
});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};