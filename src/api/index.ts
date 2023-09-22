import { Order, OrderService } from "@medusajs/medusa";
import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa/dist/types/global";
import cors from "cors";
import express, { Router } from "express";
export default (rootDirectory) => {
  const router = Router();
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;
  const storeCorsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  router.use(cors(storeCorsOptions));
  router.get(
    "/store/order-confirmation/:id",
    cors(storeCorsOptions),
    // authenticateCustomer()
    async (req, res) => {
      const orderService: OrderService = req.scope.resolve("orderService");
      const order = await orderService.retrieve(req.params.id, {
        relations: ["billing_address", "shipping_address"],
      });
      res.json({ order });
    }
  );

  router.post(
    "/store/customer-payment-methods/:id",
    cors(storeCorsOptions),
    async (req, res) => {
      
      try {
        const paymentMethodIds = req.body.paymentMethodIds;
        const stripeCustomerService = req.scope.resolve(
          "stripeCustomerService"
        );
        const paymentMethod =
          await stripeCustomerService.retrieveCustomerPaymentMethods(
            paymentMethodIds
          );

        res.json({ paymentMethod });
      } catch (error) {
        console.error("Error processing POST request:", error);
        res.status(500).json({ error });
      }
    }
  );

  return router;
};
