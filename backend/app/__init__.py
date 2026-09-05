from flask import Flask, jsonify
from backend.app.config import Config
from backend.app.extensions import db, migrate, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Health Check with Real Database Ping
    @app.route('/api/health', methods=['GET'])
    def health_check():
        from sqlalchemy import text
        db_status = "connected"
        db_error = None
        try:
            db.session.execute(text("SELECT 1"))
        except Exception as e:
            db_status = "disconnected"
            db_error = str(e)

        status_code = 200 if db_status == "connected" else 503
        return jsonify({
            'status': 'healthy' if db_status == "connected" else 'degraded',
            'system': 'ThreadCraft Luxe POS & ERP Backend',
            'database': {
                'status': db_status,
                'target': 'MySQL (garment_erp)',
                'error': db_error
            }
        }), status_code

    # Register blueprints
    from backend.app.routes.auth import auth_bp
    from backend.app.routes.products import products_bp
    from backend.app.routes.pos import pos_bp
    from backend.app.routes.bookings import bookings_bp
    from backend.app.routes.employees import employees_bp
    from backend.app.routes.customers import customers_bp
    from backend.app.routes.ledger import ledger_bp
    from backend.app.routes.purchases import purchases_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(pos_bp, url_prefix='/api/pos')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(ledger_bp, url_prefix='/api/ledger')
    app.register_blueprint(purchases_bp, url_prefix='/api/purchases')

    return app
