# **App Name**: GlamLux Marketplace

## Core Features:

- Parlour Deals Browsing & Search: Users can browse, filter, and view premium parlour deals with details including images, ratings, geo_point, and pricing. Deal expiry dates are supported, from flash deals to longer durations. Implemented without Firebase Auth, relying on local device storage for basic identification.
- Makeup Shop & Product Browsing: A dedicated e-commerce section allowing users to browse various makeup products by brand, name, and price, with current stock information. Implemented without Firebase Auth.
- Unified Glam Cart & Checkout: Allow users to add multiple parlour deals and makeup products into a single shopping cart for a combined, seamless checkout experience. Supports dual-market pricing (PKR/INR) and payment placeholders.
- Intelligent Product Recommendation Tool: On deal detail pages, leverage the 'upsell_product_id' with an AI tool to dynamically suggest a 'Recommended Products' section that complements the chosen service, enhancing the 'Bridal Upsell' strategy.
- Dynamic Shipping Cost Calculation: Calculate accurate shipping fees for makeup product orders using the Google Maps Distance Matrix API based on the shop's geo_point and the user's location, applied at checkout.
- Verified Customer Reviews & Feedback: Enable users to leave reviews only after a service or product delivery has been verified (i.e., 'qr_verification_status' or 'is_delivered' is true for a 'Bookings/Orders' entry).
- Parlour Owner Dashboard (MVP): A basic dashboard for parlour owners to view upcoming arrivals in a 'List View' and manage their schedule with a 'Weekly Calendar Grid' for planning their deals and services.

## Style Guidelines:

- Primary color: A sophisticated, dark charcoal (#3D3D40) to convey premium quality and contrast well with light text.
- Background color: A subtle, very light taupe (#F7F7F9) for a clean, minimalist canvas.
- Accent color: A warm, muted champagne gold (#C1B290) to highlight key actions and imbue a sense of luxury.
- Headline font: 'Playfair' (serif) for elegant and high-end titling.
- Body font: 'PT Sans' (sans-serif) for clear readability of descriptions and content.
- Use minimalist, line-art style icons that complement the high-end aesthetic and taupe/charcoal palette.
- Utilize ample white space to create a clean, uncluttered user experience, typical of minimalist design.
- Subtle and smooth transitions for page loads and interactive elements to maintain a premium feel.