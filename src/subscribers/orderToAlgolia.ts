import algoliasearch from "algoliasearch";
import { Order } from "@medusajs/medusa";
import insightsClient from "search-insights";

class OrderToAlgoliaSubscriber {
  orderService: any;
  algoliaClient: any;
  algoliaIndex: any;

  constructor({ eventBusService, orderService }) {
    this.orderService = orderService;

    // Initialize Algolia client and index
    const algoliaAppId = "2L5TYYBU6R";
    const algoliaSearchApiKey = "a2e63622dcbc6590e64f68049796773a";
    const algoliaIndexName = "products";

    this.algoliaClient = algoliasearch(algoliaAppId, algoliaSearchApiKey);
    this.algoliaIndex = this.algoliaClient.initIndex(algoliaIndexName);

    eventBusService.subscribe("order.placed", this.handleOrder);
  }

  handleOrder = async (data) => {
    console.log(data);

    insightsClient("init", {
      apiKey: "a2e63622dcbc6590e64f68049796773a",
      appId: "2L5TYYBU6R",
    });

    try {
      const order: Order = await this.orderService.retrieve(data.id, {
        select: ["id", "created_at", "customer", "items"],
        relations: ["customer", "items", "items.variant"],
      });

      console.log("Order data:", order);

      insightsClient("convertedObjectIDs", {
        userToken: order.customer_id,
        index: "products",
        eventName: "Order Placed",
        objectIDs: order.items.map((item) => item.variant.product_id),
      });
    } catch (error) {
      console.error("Error", error);
    }
  };
}

export default OrderToAlgoliaSubscriber;
