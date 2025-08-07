const express = require("express");
const router = express.Router();
const stripe = require("../stripe/stripe");
const Order = require("../modals/Order");
const Payment = require("../modals/payment");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isTestMode = true;

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("req: ", req);
    let event;

    try {
      if (isTestMode) {
        event = JSON.parse(req.body.toString());
      } else {
        const signature = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      }

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const intentId = paymentIntent.id?.trim();
        console.log("intentId:", intentId);

        const order = await Order.findOne({ stripePaymentIntentId: intentId });

        if (!order) {
          console.log("⚠️ Order not found for paymentIntent:", intentId);
          return res.status(404).send({ message: "Order not found" });
        }

        const existingPayment = await Payment.findOne({
          userId: order.userId,
          orderId: order._id,
          paymentIntentId: intentId,
        });

        if (existingPayment) {
          return res.status(200).send({ message: "Payment already received" });
        }
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: intentId },
          {
            paymentStatus: "paid",
            orderStatus: "confirmed",
          }
        );
        const newPayment = new Payment({
          userId: order.userId,
          orderId: order._id,
          paymentIntentId: intentId,
          amount: order.totalAmount,
          status: "paid",
        });

        await newPayment.save();
        console.log("✅ Payment entry saved.");

        return res.status(200).send({ message: "Payment succeeded" });
      }
      return res.status(200).send({ message: "Event ignored" });
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }
);

module.exports = router;
