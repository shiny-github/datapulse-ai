import random
import csv
from datetime import date, timedelta

random.seed(42)

PRODUCTS = [
    ("Laptop Pro 15", "Electronics", 1299.99),
    ("Wireless Headphones", "Electronics", 149.99),
    ("USB-C Hub", "Electronics", 49.99),
    ("Mechanical Keyboard", "Electronics", 89.99),
    ("4K Monitor", "Electronics", 399.99),
    ("Running Shoes X1", "Footwear", 89.99),
    ("Trail Blazer Boots", "Footwear", 129.99),
    ("Yoga Mat Pro", "Sports", 39.99),
    ("Resistance Bands Set", "Sports", 24.99),
    ("Protein Powder", "Health", 59.99),
    ("Vitamin D3 Pack", "Health", 19.99),
    ("Office Chair Ergo", "Furniture", 349.99),
    ("Standing Desk", "Furniture", 499.99),
    ("Bookshelf Classic", "Furniture", 199.99),
    ("Coffee Maker Pro", "Appliances", 79.99),
    ("Air Purifier", "Appliances", 149.99),
    ("Blender Ultra", "Appliances", 69.99),
    ("Denim Jacket", "Clothing", 79.99),
    ("Wool Sweater", "Clothing", 59.99),
    ("Classic T-Shirt", "Clothing", 24.99),
    ("Novel: The Deep", "Books", 14.99),
    ("Cookbook Essentials", "Books", 29.99),
    ("Self-Help Guide", "Books", 16.99),
    ("Skincare Set", "Beauty", 59.99),
    ("Shampoo Premium", "Beauty", 19.99),
    ("Smart Watch Series 5", "Electronics", 249.99),
    ("Tablet Pro 11", "Electronics", 699.99),
    ("Portable Speaker", "Electronics", 79.99),
    ("Gaming Mouse", "Electronics", 59.99),
    ("Webcam HD", "Electronics", 69.99),
]

REGIONS = ["North", "South", "East", "West", "Central", "Northeast", "Southwest", "Pacific"]
STATUSES = ["completed", "completed", "completed", "returned", "pending", "cancelled", "completed", "completed"]
PAYMENT_METHODS = ["credit_card", "credit_card", "debit_card", "paypal", "bank_transfer", "crypto", "gift_card"]
RETURN_FLAGS = [False, False, False, False, False, True]

start_date = date(2023, 1, 1)

rows = []
for i in range(1, 10001):
    product, category, base_price = random.choice(PRODUCTS)
    price_var = base_price * random.uniform(0.9, 1.1)
    price = round(price_var, 2)
    quantity = random.choices([1, 2, 3, 4, 5, 6], weights=[40, 25, 15, 10, 6, 4])[0]
    discount_pct = random.choices([0, 5, 10, 15, 20, 25, 30], weights=[35, 20, 15, 10, 10, 7, 3])[0]
    revenue = round(price * quantity * (1 - discount_pct / 100), 2)
    # Seasonal bump
    day_offset = random.randint(0, 729)
    order_date = start_date + timedelta(days=day_offset)
    if order_date.month in (11, 12):
        revenue = round(revenue * random.uniform(1.1, 1.3), 2)
    shipping_days = random.choices([1, 2, 3, 4, 5, 7, 10, 14], weights=[5, 15, 25, 20, 15, 10, 7, 3])[0]
    status = random.choice(STATUSES)
    return_flag = status == "returned" or (random.random() < 0.05)
    # Inject some nulls (~3%)
    if random.random() < 0.03:
        discount_pct = ""
    if random.random() < 0.02:
        shipping_days = ""

    rows.append({
        "order_id": f"ORD-{i:06d}",
        "order_date": order_date.isoformat(),
        "product": product,
        "category": category,
        "price": price,
        "quantity": quantity,
        "revenue": revenue,
        "region": random.choice(REGIONS),
        "customer_id": f"CUST-{random.randint(1, 3000):05d}",
        "status": status,
        "return_flag": return_flag,
        "payment_method": random.choice(PAYMENT_METHODS),
        "shipping_days": shipping_days,
        "discount_percent": discount_pct,
    })

fieldnames = [
    "order_id", "order_date", "product", "category", "price", "quantity",
    "revenue", "region", "customer_id", "status", "return_flag",
    "payment_method", "shipping_days", "discount_percent",
]

with open("sample_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} rows -> sample_data.csv")
