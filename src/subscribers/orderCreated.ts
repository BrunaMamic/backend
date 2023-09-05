import { WebClient } from "@slack/web-api";

class OrderNotifierSubscriber {
  orderService: any;
  constructor({ eventBusService, orderService }) {
    this.orderService = orderService;
    eventBusService.subscribe("order.placed", this.handleOrder);
  }

  handleOrder = async (data) => {
    const slackWebhookUrl =
      "xoxb-5842684770389-5869406410352-xFDtwrDC7Sw7lCGXoJ8cf08w";
    const slackChannel = "#test";

    const slackClient = new WebClient(slackWebhookUrl);

    try {
      const order = await this.orderService.retrieve(data.id, {
        select: [
          "shipping_total",
          "discount_total",
          "tax_total",
          "refunded_total",
          "gift_card_total",
          "subtotal",
          "total",
        ],
        relations: [
          "customer",
          "items",
          "billing_address",
          "shipping_address",
          "discounts",
          "discounts.rule",
          "shipping_methods",
          "payments",
          "fulfillments",
          "returns",
          "gift_cards",
          "gift_card_transactions",
          "swaps",
          "swaps.return_order",
          "swaps.payment",
          "swaps.shipping_methods",
          "swaps.shipping_address",
          "swaps.additional_items",
          "swaps.fulfillments",
        ],
      });

      const itemBlocks = order.items.map((item) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<http://localhost:3000/shop|${item.title}>*\nQuantity: ${
              item.quantity
            } \n ${item.description}\n ${(item.total / 100).toFixed(2)}${
              order.region.currency_code === "usd" ? "£" : "€"
            }`,
          },
          accessory: {
            type: "image",
            image_url: `${item.thumbnail?.replace(
              "http://localhost:9000",
              "https://dca8-93-143-52-59.ngrok.io"
            )}`,
            alt_text: "Product image",
          },
        };
      });

      const orderDate = new Date(order.created_at);
      const formattedDate = orderDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });

      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Order with *${order.items.length} items* was just submited by *${order.customer.first_name} ${order.customer.last_name}* ! \n_it will be shipped soon!_`,
          },
        },
        {
          type: "divider",
        },

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*DATE:* ${formattedDate}     *ORDER No:* ${order.display_id}! `,
          },
        },
        {
          type: "divider",
        },
        ...itemBlocks,
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*SUBTOTAL:* ${(order.subtotal / 100).toFixed(2)} ${
              order.region.currency_code === "usd" ? "£" : "€"
            }\n*SHIPPING:* OVO NAPRAVI! \n*DISCOUNT TOTAL:* ${
              order.discount_total
            }${
              order.region.currency_code === "usd" ? "£" : "€"
            } \n*SUBTOTAL:* ${(order.total / 100).toFixed(2)} ${
              order.region.currency_code === "usd" ? "£" : "€"
            }`,
          },
        },
        {
            type: "divider",
          },
      ];

      await slackClient.chat.postMessage({
        channel: slackChannel,
        blocks: blocks,
      });
    } catch (error) {
      console.error("Error sending Slack notification:", error);
    }
  };
}

export default OrderNotifierSubscriber;

// import { WebClient } from "@slack/web-api";

// class OrderNotifierSubscriber {
//   orderService: any;
//   constructor({ eventBusService, orderService }) {
//     this.orderService = orderService;
//     eventBusService.subscribe("order.placed", this.handleOrder);
//   }

//   handleOrder = async (data) => {
//     const slackWebhookUrl =
//       "xoxb-5842684770389-5869406410352-xFDtwrDC7Sw7lCGXoJ8cf08w";
//     const slackChannel = "#test";

//     const slackClient = new WebClient(slackWebhookUrl);

//     try {
//       const order = await this.orderService.retrieve(data.id, {
//         select: [
//           "shipping_total",
//           "discount_total",
//           "tax_total",
//           "refunded_total",
//           "gift_card_total",
//           "subtotal",
//           "total",
//         ],
//         relations: [
//           "customer",
//           "items",
//           "billing_address",
//           "shipping_address",
//           "discounts",
//           "discounts.rule",
//           "shipping_methods",
//           "payments",
//           "fulfillments",
//           "returns",
//           "gift_cards",
//           "gift_card_transactions",
//           "swaps",
//           "swaps.return_order",
//           "swaps.payment",
//           "swaps.shipping_methods",
//           "swaps.shipping_address",
//           "swaps.additional_items",
//           "swaps.fulfillments",
//         ],
//       });
//       const customerFirstName = order.customer.first_name;

//       // Map over items if it's an array
//       const itemDetails = order.items.map((item) => {
//         return {
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           title: item.title,
//         };
//       });

//       const slackMessage = `New Order: ${
//         order.display_id
//       }\nCustomer: ${order.customer.first_name} ${order.customer.last_name}\nContact: ${order.email} ${order.customer.phone}
//       \nShipping Total: ${
//         order.shipping_total
//       } ${order.region.currency_code === 'usd' ? '£' : '€'}
//       \nDiscount Total: ${order.discount_total} ${order.region.currency_code === 'usd' ? '£' : '€'}
//       \nTax Total: ${
//         order.tax_total
//       } ${order.region.currency_code === 'usd' ? '£' : '€'}
//       \nTotal: ${order.total} ${order.region.currency_code === 'usd' ? '£' : '€'}
//       \nItem Details:\n${itemDetails
//         .map((item) => `${item.quantity}x ${item.title} - ${item.total} ${order.region.currency_code === 'usd' ? '£' : '€'}`)
//         .join("\n")}`;

//       await slackClient.chat.postMessage({
//         channel: slackChannel,
//         text: slackMessage,
//       });

//     } catch (error) {
//       console.error("Error sending Slack notification:", error);
//     }
//   };
// }

// export default OrderNotifierSubscriber;
