// import { Order, OrderService } from "@medusajs/medusa";
// import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
// import { ConfigModule } from "@medusajs/medusa/dist/types/global";
// import cors from "cors";
// import { Router } from "express";
// export default (rootDirectory) => {
//   const router = Router();
//   const { configModule } = getConfigFile<ConfigModule>(
//     rootDirectory,
//     "medusa-config"
//   );
//   const { projectConfig } = configModule;
//   const storeCorsOptions = {
//     origin: projectConfig.store_cors.split(","),
//     credentials: true,
//   };

//   router.options("/store/order-confirmation/:id", cors(storeCorsOptions));
//   router.get(
//     "/store/order-confirmation/:id",
//     cors(storeCorsOptions),
//     // authenticateCustomer()
//     async (req, res) => {
//       const orderService: OrderService = req.scope.resolve("orderService");
//       const order = await orderService.retrieve(req.params.id, {
//         relations: ["billing_address", "shipping_address"],
//       });
//       res.json({ order });
      
//     }
//   );

//   return router
// };
import { Router } from "express";
import cors from "cors";
import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa/dist/types/global";


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

  router.options("/store/customer-payment-methods/:id", cors(storeCorsOptions));
  router.post("/store/customer-payment-methods/:id", async (req, res) => {
    const paymentMethodId = req.body.paymentmethod_ids;
    const stripeCustomerService = req.scope.resolve("stripeCustomerService");
    const paymentMethod =
      await stripeCustomerService.retrieveCustomerPaymentMethods(
        paymentMethodId
      );
    res.json({ paymentMethod });
  });

  return router;
};



