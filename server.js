import { configDotenv } from "dotenv";
import express from "express";
import Stripe from "stripe";

configDotenv();
const app = express();
app.use(express.json());
app.use(express.static("public"));

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn Node.js Today" }],
  [2, { priceInCents: 20000, name: "Learn Vue Today" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.qty,
        };
      }),
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

const port = process.env.WEB_PORT || 3001;
app.listen(port, () => console.log("Server running on http://localhost:3000"));
