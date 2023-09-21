import { Router } from "express";
import  StripeCustomerService from "../services/index"; // Import your StripeCustomerService
import cors from "cors";
import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa/dist/types/global";


export default (rootDirectory) => {
  const router = Router();
  const stripeCustomerService = new StripeCustomerService(); // Initialize your StripeCustomerService

  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );

  const { projectConfig } = configModule;
  const storeCorsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };

  router.options("/store/customer-payment-methods/:customerId", cors(storeCorsOptions));
  router.get(
    "/store/customer-payment-methods/:customerId",
    cors(storeCorsOptions),
    // authenticateCustomer()
    async (req, res) => {
      try {
        const { customerId } = req.params;
        console.log("Customer ID:", customerId);
    
        const paymentMethods = await stripeCustomerService.retrieveCustomerPaymentMethods(
          customerId,
          []
        );
        
        res.json({ paymentMethods });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  return router;
};

