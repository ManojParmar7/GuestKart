// const express = require("express");
// const router = express.Router();
// const stripe = require("../stripe/stripe");
// const Order = require("../modals/Order");
// const Payment = require("../modals/payment");

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
// const isTestMode = true;

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let event;

//     try {
//       if (isTestMode) {
//         event = JSON.parse(req.body.toString());
//       } else {
//         const signature = req.headers["stripe-signature"];
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           endpointSecret
//         );
//       }

//       switch (event.type) {
//         // ✅ Payment successful
//         case "payment_intent.succeeded": {
//           const paymentIntent = event.data.object;
//           const intentId = paymentIntent.id?.trim();

//           const order = await Order.findOne({
//             stripePaymentIntentId: intentId,
//           });
//           if (!order) {
//             console.log("⚠️ Order not found for paymentIntent:", intentId);
//             return res.status(404).send({ message: "Order not found" });
//           }

//           // check existing payment (session wise)
//           const existingPayment = await Payment.findOne({
//             sessionId: order.sessionId, // ✅ userId ki jagah sessionId
//             orderId: order._id,
//             paymentIntentId: intentId,
//           });

//           if (existingPayment) {
//             return res
//               .status(200)
//               .send({ message: "Payment already received" });
//           }

//           // ✅ Update order
//           await Order.findOneAndUpdate(
//             { stripePaymentIntentId: intentId },
//             {
//               paymentStatus: "PAID",
//               orderStatus: "CONFIRMED",
//             }
//           );

//           // ✅ Save payment entry
//           const newPayment = new Payment({
//             sessionId: order.sessionId, // ✅
//             orderId: order._id,
//             paymentIntentId: intentId,
//             amount: order.totalAmount,
//             status: "PAID",
//           });

//           await newPayment.save();
//           console.log("✅ Payment entry saved.");
//           break;
//         }

//         // ❌ Payment failed
//         case "payment_intent.payment_failed": {
//           const paymentIntent = event.data.object;
//           const intentId = paymentIntent.id?.trim();

//           await Order.findOneAndUpdate(
//             { stripePaymentIntentId: intentId },
//             { paymentStatus: "failed", orderStatus: "cancelled" }
//           );

//           console.log("❌ Payment failed for intent:", intentId);
//           break;
//         }

//         // 🔄 Refund case
//         case "charge.refunded": {
//           const charge = event.data.object;
//           const intentId = charge.payment_intent;

//           await Order.findOneAndUpdate(
//             { stripePaymentIntentId: intentId },
//             { paymentStatus: "refunded", orderStatus: "returned" }
//           );

//           console.log("💸 Payment refunded:", intentId);
//           break;
//         }

//         default:
//           console.log("Unhandled event type:", event.type);
//       }

//       return res.status(200).send({ message: "Webhook processed" });
//     } catch (err) {
//       console.error("Webhook error:", err);
//       return res.status(400).send({ error: err.message });
//     }
//   }
// );

// module.exports = router;
// routes/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("../stripe/stripe");
const Order = require("../modals/Order");
const Payment = require("../modals/payment");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isTestMode = true;

/**
 * Order Status Flow:
 * created -> CONFIRMED -> approved/rejected -> shipped -> delivered
 * cancelled (if fail) / returned (if refund)
 *
 * Payment Status Flow:
 * pending -> PAID -> failed -> refunded
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      // ✅ Handle Test & Live Mode
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

      switch (event.type) {
        /**
         * ✅ Payment Successful
         * - paymentStatus = PAID
         * - orderStatus = CONFIRMED
         */
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          const intentId = paymentIntent.id?.trim();

          const order = await Order.findOne({
            stripePaymentIntentId: intentId,
          });
          if (!order) {
            console.log("⚠️ Order not found for paymentIntent:", intentId);
            return res.status(404).send({ message: "Order not found" });
          }

          // ✅ COD orders ko ignore karo
          if (order.paymentMethod === "COD") {
            console.log(
              "🚫 COD order hai, online payment allow nahi:",
              order._id
            );
            return res
              .status(200)
              .send({ message: "COD order, no online payment" });
          }

          // check existing payment
          const existingPayment = await Payment.findOne({
            sessionId: order.sessionId,
            orderId: order._id,
            paymentIntentId: intentId,
          });

          if (existingPayment) {
            return res
              .status(200)
              .send({ message: "Payment already received" });
          }

          // ✅ Update Order
          await Order.findOneAndUpdate(
            { stripePaymentIntentId: intentId },
            {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED", // Payment ke baad CONFIRMED
            }
          );

          // ✅ Save Payment Entry
          await Payment.create({
            sessionId: order.sessionId,
            orderId: order._id,
            paymentIntentId: intentId,
            amount: order.finalAmount || order.totalAmount,
            status: "PAID",
          });

          console.log("✅ Payment succeeded & order CONFIRMED:", intentId);
          break;
        }

        /**
         * ❌ Payment Failed
         * - paymentStatus = failed
         * - orderStatus = cancelled
         */
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          const intentId = paymentIntent.id?.trim();

          await Order.findOneAndUpdate(
            { stripePaymentIntentId: intentId },
            {
              paymentStatus: "failed",
              orderStatus: "cancelled",
            }
          );

          console.log("❌ Payment failed for intent:", intentId);
          break;
        }

        /**
         * 🔄 Refund Issued
         * - paymentStatus = refunded
         * - orderStatus = returned
         */
        case "charge.refunded": {
          const charge = event.data.object;
          const intentId = charge.payment_intent;

          await Order.findOneAndUpdate(
            { stripePaymentIntentId: intentId },
            {
              paymentStatus: "refunded",
              orderStatus: "returned",
            }
          );

          console.log("💸 Payment refunded:", intentId);
          break;
        }

        default:
          console.log("ℹ️ Unhandled event type:", event.type);
      }

      return res.status(200).send({ message: "Webhook processed" });
    } catch (err) {
      console.error("❌ Webhook error:", err);
      return res.status(400).send({ error: err.message });
    }
  }
);

module.exports = router;
