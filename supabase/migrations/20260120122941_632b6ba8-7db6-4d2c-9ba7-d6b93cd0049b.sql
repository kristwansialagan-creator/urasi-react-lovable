-- Fix existing media slugs that incorrectly include bucket name prefix
UPDATE medias 
SET slug = SUBSTRING(slug FROM LENGTH('product-images/') + 1)
WHERE slug LIKE 'product-images/%';