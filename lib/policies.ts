// Basic policy copy. Specifics (timelines, fees) are deliberately left to WhatsApp
// confirmation until the shop owner supplies final wording.
export type Policy = {
  title: string;
  description: string;
  sections: { heading: string; body: string[] }[];
};

export const POLICY_SLUGS = ["shipping", "returns", "privacy", "terms"] as const;
export type PolicySlug = (typeof POLICY_SLUGS)[number];

export const POLICIES: Record<PolicySlug, Policy> = {
  shipping: {
    title: "Shipping & Delivery",
    description: "How Comfort Cottons orders are confirmed, packed and delivered.",
    sections: [
      {
        heading: "How ordering works",
        body: [
          "Orders are placed through WhatsApp. Add your pieces to the cart, send the order message, and we will reply personally to confirm availability, the final amount, payment and delivery details.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "We deliver across India. Delivery charges and the expected delivery time depend on your pincode and are confirmed with you on WhatsApp before you pay.",
          "Please share your full name, delivery address and pincode when you place the order so we can dispatch without delay.",
        ],
      },
      {
        heading: "Need help with a delivery?",
        body: ["Message us on WhatsApp with your order details and we will look into it."],
      },
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    description: "What to do if your Comfort Cottons order arrives damaged or incorrect.",
    sections: [
      {
        heading: "Damaged or incorrect items",
        body: [
          "If your order arrives damaged or is not what you ordered, message us on WhatsApp as soon as you receive it with a photo of the item and the packaging. We will arrange a replacement or a resolution with you.",
        ],
      },
      {
        heading: "Unused items",
        body: [
          "Items should be unwashed, unused and in their original packaging to be considered for an exchange. The exact time window and any conditions are confirmed with you when you order.",
        ],
      },
      {
        heading: "Colour differences",
        body: [
          "Product photos are taken in natural light and screens vary, so colours can look slightly different in person. Ask us on WhatsApp if you would like more detail before ordering.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "What information Comfort Cottons collects and how it is used.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "When you order, you share your name, phone number and delivery address with us over WhatsApp. We use this only to confirm, pack and deliver your order and to answer your questions.",
          "Your shopping cart is kept in your own browser so it is still there when you return. It is not sent to us until you choose to send your order.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "We do not sell your information. We share your delivery details with a courier only as needed to deliver your order.",
        ],
      },
      {
        heading: "Third-party services",
        body: [
          "This site uses WhatsApp for orders, Cloudinary for images, and Clerk for the sign-in used by the shop owner. These services have their own privacy policies.",
        ],
      },
      {
        heading: "Contact",
        body: ["To ask about or request deletion of your details, message us on WhatsApp."],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "The terms for using the Comfort Cottons website and placing orders.",
    sections: [
      {
        heading: "Orders",
        body: [
          "Showing a product on this website is not a guarantee of stock. An order is confirmed only when we confirm it with you on WhatsApp.",
        ],
      },
      {
        heading: "Prices",
        body: [
          "Prices are shown in Indian rupees (₹). The cart total is an estimate; the final amount, including any delivery charges, is confirmed on WhatsApp before payment.",
        ],
      },
      {
        heading: "Products",
        body: [
          "We try to describe and photograph every product accurately. Sizes and colours may vary slightly from what appears on screen.",
        ],
      },
      {
        heading: "Changes",
        body: ["We may update these terms and our other policies from time to time. The version on this page applies."],
      },
    ],
  },
};
