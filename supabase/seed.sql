-- ============================================================================
-- Seed data — Appendix A mock catalogue (7 listings).
-- Inserts structured rows only. The description embeddings in property_vectors
-- are generated once via the n8n "Seed Embeddings" workflow (see workflows guide),
-- which reuses the same Google embedding model as the live Add-Listing flow.
-- image_url is left NULL here; add real image URLs later (or via the broker form).
-- ============================================================================

insert into public.properties (title, property_type, listing_type, location, price, description, image_url) values
('Two-bedroom apartment','apartment','for_sale','Lozenets, Sofia',189000,
 'Bright two-bedroom with a renovated kitchen, oak flooring, a large south-facing balcony, and a separate storage room. Quiet street, close to parks and metro.', null),
('Studio','studio','for_sale','Studentski Grad, Sofia',72000,
 'Compact furnished studio ideal for students or investment. Newly built block, elevator, secured entrance, low maintenance fees.', null),
('Three-bedroom house','house','for_sale','Bistritsa, Sofia',415000,
 'Detached family house with a garden, garage for two cars, fireplace, and panoramic mountain views. Needs minor cosmetic updates.', null),
('One-bedroom apartment','apartment','for_sale','Center, Plovdiv',98500,
 'Renovated one-bedroom in a historic building, high ceilings, original details, walking distance to the Old Town. No elevator, third floor.', null),
('Maisonette','apartment','for_sale','Vitosha, Sofia',312000,
 'Spacious two-level maisonette with three bedrooms, two bathrooms, a private terrace, underfloor heating, and a dedicated parking spot.', null),
('Two-bedroom apartment','apartment','for_rent','Mladost, Sofia',950,
 'Modern furnished two-bedroom for rent, air conditioning, fully equipped kitchen, balcony, close to a metro station and a shopping mall.', null),
('Office space','office','for_rent','Business Park, Sofia',1450,
 'Open-plan office of 120 sqm in a class A business building, air conditioning, server room, 4 parking spots, ready to move in.', null);
