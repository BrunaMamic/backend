import { uniqBy } from "lodash";
import { BaseService } from "medusa-interfaces";
import stripe, { Stripe } from "stripe";
class StripeCustomerService extends BaseService {
  protected stripe: Stripe;
  constructor() {
    super();
    this.stripe = new stripe(
      "sk_test_51NrxZwKjuX4EdlrbSiJoQOCwQmTR60IuTxc0HAnbAeWocUcLW9ahdTtAL0jPc9jMsLH8myS9Dp2SA9zpEtNivdtZ005oONlMCG",
      {
        apiVersion: "2022-11-15",
      }
    );
  }
  async retrieveCustomerPaymentMethods(
    paymentMethodIds: []
  ) {
    const paymentMethods = [];
    for (const paymentMethodId of paymentMethodIds) {
      const response = await this.stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      if (response.id) {
        paymentMethods.push({
          last4: response.card.last4,
          name: response.billing_details.name,
          experation: response.card.exp_month + "/" + response.card.exp_year,
          brand: response.card.brand,
        });
      }
    }
    const uniquePaymentMethods = uniqBy(paymentMethods, "last4");
    return uniquePaymentMethods;
  }
}
export default StripeCustomerService;