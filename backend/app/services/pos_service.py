from backend.app.extensions import db
from backend.app.models.product import Product
from backend.app.models.order import SalesOrder, SalesOrderItem
from backend.app.models.customer import Customer
from backend.app.models.ledger import LedgerEntry
from datetime import datetime

class POSService:
    @staticmethod
    def process_checkout(order_data):
        """
        Executes atomic checkout:
        1. Validates stock for all items
        2. Deducts stock quantity
        3. Creates SalesOrder and SalesOrderItems
        4. Updates Customer balance if credit
        5. Creates LedgerEntry for financial records
        All wrapped in a single database transaction.
        """
        try:
            items = order_data.get('items', [])
            if not items:
                raise ValueError("Order contains no items")

            subtotal = float(order_data.get('subtotal', 0.0))
            discount = float(order_data.get('discount', 0.0))
            tax = float(order_data.get('tax', 0.0))
            total = float(order_data.get('total', 0.0))
            payment_method = order_data.get('paymentMethod', 'Cash')
            customer_id = order_data.get('customerId')
            customer_name = order_data.get('customerName', 'Walk-in Customer')
            cashier_name = order_data.get('cashierName', 'Cashier')

            # 1. Check stock & deduct
            for item in items:
                prod_id = item.get('productId')
                qty = int(item.get('quantity', 1))
                if prod_id:
                    product = Product.query.get(prod_id)
                    if product:
                        if product.stock < qty:
                            raise ValueError(f"Insufficient stock for {product.name}. Available: {product.stock}")
                        product.stock -= qty

            # 2. Create Order
            order = SalesOrder(
                id=order_data.get('id'),
                order_no=order_data.get('orderNo'),
                customer_id=customer_id,
                customer_name=customer_name,
                cashier_name=cashier_name,
                subtotal=subtotal,
                discount=discount,
                tax=tax,
                total=total,
                payment_method=payment_method,
                status='Completed',
                items_data=items,
                created_at=datetime.utcnow()
            )
            db.session.add(order)

            # 3. Create items
            for idx, item in enumerate(items):
                order_item = SalesOrderItem(
                    id=f"{order.id}-ITM-{idx+1}",
                    order_id=order.id,
                    product_id=item.get('productId'),
                    product_name=item.get('name', 'Product'),
                    sku=item.get('sku'),
                    quantity=int(item.get('quantity', 1)),
                    unit_price=float(item.get('price', 0.0)),
                    total_price=float(item.get('total', 0.0))
                )
                db.session.add(order_item)

            # 4. Update Customer if credit
            if customer_id and payment_method.lower() == 'credit':
                cust = Customer.query.get(customer_id)
                if cust:
                    cust.balance = float(cust.balance or 0.0) + total

            # 5. Create Ledger Entry
            ledger = LedgerEntry(
                id=f"LED-{order.order_no}",
                date=datetime.utcnow().strftime('%Y-%m-%d'),
                type='Credit',
                category='Sales',
                party_type='Customer',
                party_name=customer_name,
                description=f"POS Sale {order.order_no} via {payment_method}",
                amount=total,
                reference=order.order_no
            )
            db.session.add(ledger)

            db.session.commit()
            return order
        except Exception:
            db.session.rollback()
            raise
