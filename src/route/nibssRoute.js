import express from "express";
import { registerFintechController , 
    createBVNController , 
    createUserController,
    fintechLoginController,
    createNINController,
    validateBVNController,
    validateNINController,
    nameEnquiryController,
    getAllAccountsController,
    getAccountBalanceController,
    initiateTransferController,
    getTransactionStatusController 
} from "../controllers/nibssController.js";

const router = express.Router();


router.post("/register", registerFintechController);
router.post("/createBVN", createBVNController);
router.post("/createUser", createUserController);
router.post("/fintechLogin", fintechLoginController);
router.post("/createNIN", createNINController);
router.post("/validateBVN", validateBVNController);
router.post("/validateNIN", validateNINController);
router.get("/name-enquiry/:accountNumber", nameEnquiryController);
router.get("/accounts", getAllAccountsController);
router.get("/account/balance/:accountNumber", getAccountBalanceController);
router.post("/transfer", initiateTransferController);
router.get("/transaction/:transactionId", getTransactionStatusController);

export default router;
