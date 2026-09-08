CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  sizes TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  product_id BIGINT NOT NULL
    REFERENCES products(id)
    ON DELETE CASCADE,

  image_url TEXT NOT NULL,
  image_public_id TEXT NOT NULL UNIQUE,

  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX product_images_one_primary_idx
ON product_images(product_id)
WHERE is_primary = TRUE;

CREATE TABLE highlights (
  id SERIAL PRIMARY KEY,

  title VARCHAR(255) NOT NULL,
  athlete VARCHAR(255) NOT NULL,

  media_type VARCHAR(10) NOT NULL
    CHECK (media_type IN ('video', 'image')),

  media_url TEXT NOT NULL,
  media_public_id TEXT NOT NULL UNIQUE,

  thumbnail_url TEXT,
  thumbnail_public_id TEXT UNIQUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  author VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,

  product_id BIGINT
    REFERENCES products(id)
    ON DELETE SET NULL,

  product_name VARCHAR(255) NOT NULL,

  rating INTEGER NOT NULL
    CHECK (rating BETWEEN 1 AND 5),

  review_text TEXT NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (
      status IN ('pending', 'approved', 'rejected')
    ),

  featured BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (
    featured = FALSE
    OR status = 'approved'
  )
);

CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,

  admin_id INTEGER NOT NULL
    REFERENCES admins(id),

  action VARCHAR(50) NOT NULL,

  entity_type VARCHAR(30),
  entity_id BIGINT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);