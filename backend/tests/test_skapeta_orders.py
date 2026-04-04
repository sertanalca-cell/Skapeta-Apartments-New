"""
Skapeta Apartments - Food Ordering System Backend Tests
Tests: Menu Items, Orders, Customer Auth, Admin Auth, Settings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://skapeta-modern.preview.emergentagent.com')

# Test data
TEST_CUSTOMER = {
    "first_name": "TestPytest",
    "last_name": "Customer"
}

ADMIN_CREDENTIALS = {
    "email": "admin@skapeta.com",
    "password": "admin123"
}


class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print("✅ API root endpoint working")


class TestMenuItems:
    """Menu Items API tests"""
    
    def test_get_all_menu_items(self):
        """Test getting all menu items"""
        response = requests.get(f"{BASE_URL}/api/menu-items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Got {len(data)} menu items")
    
    def test_get_available_menu_items(self):
        """Test getting only available menu items"""
        response = requests.get(f"{BASE_URL}/api/menu-items?available_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All items should be available
        for item in data:
            assert item.get("available", True) == True
        print(f"✅ Got {len(data)} available menu items")
    
    def test_menu_item_structure(self):
        """Test menu item has required fields"""
        response = requests.get(f"{BASE_URL}/api/menu-items?available_only=true")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "name" in item
            assert "price" in item
            assert "category" in item
            print(f"✅ Menu item structure valid: {item['name']}")


class TestCustomerAuth:
    """Customer authentication tests"""
    
    def test_customer_register(self):
        """Test customer registration"""
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json=TEST_CUSTOMER
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == TEST_CUSTOMER["first_name"]
        assert data["last_name"] == TEST_CUSTOMER["last_name"]
        assert "id" in data
        print(f"✅ Customer registered: {data['first_name']} {data['last_name']}")
    
    def test_customer_login(self):
        """Test customer login"""
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json=TEST_CUSTOMER
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == TEST_CUSTOMER["first_name"]
        assert "id" in data
        print(f"✅ Customer logged in: {data['id']}")
        return data["id"]


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("✅ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("✅ Invalid admin login rejected")


class TestOrders:
    """Orders API tests"""
    
    @pytest.fixture
    def customer_id(self):
        """Get or create customer"""
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json=TEST_CUSTOMER
        )
        return response.json()["id"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        return response.json()["access_token"]
    
    @pytest.fixture
    def menu_item(self):
        """Get first available menu item"""
        response = requests.get(f"{BASE_URL}/api/menu-items?available_only=true")
        items = response.json()
        if len(items) > 0:
            return items[0]
        pytest.skip("No menu items available")
    
    def test_create_order(self, customer_id, menu_item):
        """Test creating an order"""
        order_data = {
            "user_id": customer_id,
            "first_name": TEST_CUSTOMER["first_name"],
            "last_name": TEST_CUSTOMER["last_name"],
            "apartment_number": "TEST-101",
            "items": [
                {
                    "menu_item_id": menu_item["id"],
                    "menu_item_name": menu_item["name"],
                    "quantity": 2,
                    "price": menu_item["price"]
                }
            ],
            "notes": "Test order from pytest"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json=order_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == customer_id
        assert data["status"] == "pending"
        assert data["total_price"] == menu_item["price"] * 2
        assert "order_number" in data
        print(f"✅ Order created: #{data['order_number']}, Total: €{data['total_price']}")
        return data["id"]
    
    def test_get_order_by_id(self, customer_id, menu_item):
        """Test getting order by ID"""
        # First create an order
        order_data = {
            "user_id": customer_id,
            "first_name": TEST_CUSTOMER["first_name"],
            "last_name": TEST_CUSTOMER["last_name"],
            "apartment_number": "TEST-102",
            "items": [
                {
                    "menu_item_id": menu_item["id"],
                    "menu_item_name": menu_item["name"],
                    "quantity": 1,
                    "price": menu_item["price"]
                }
            ]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        # Get the order
        response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        print(f"✅ Got order by ID: {order_id}")
    
    def test_get_user_orders(self, customer_id, menu_item):
        """Test getting orders by user ID"""
        # Create an order first
        order_data = {
            "user_id": customer_id,
            "first_name": TEST_CUSTOMER["first_name"],
            "last_name": TEST_CUSTOMER["last_name"],
            "apartment_number": "TEST-103",
            "items": [
                {
                    "menu_item_id": menu_item["id"],
                    "menu_item_name": menu_item["name"],
                    "quantity": 1,
                    "price": menu_item["price"]
                }
            ]
        }
        requests.post(f"{BASE_URL}/api/orders", json=order_data)
        
        # Get user orders
        response = requests.get(f"{BASE_URL}/api/orders/user/{customer_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Got {len(data)} orders for user")
    
    def test_admin_get_all_orders(self, admin_token):
        """Test admin getting all orders"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Admin got {len(data)} orders")
    
    def test_admin_update_order_status(self, admin_token, customer_id, menu_item):
        """Test admin updating order status"""
        # Create order
        order_data = {
            "user_id": customer_id,
            "first_name": TEST_CUSTOMER["first_name"],
            "last_name": TEST_CUSTOMER["last_name"],
            "apartment_number": "TEST-104",
            "items": [
                {
                    "menu_item_id": menu_item["id"],
                    "menu_item_name": menu_item["name"],
                    "quantity": 1,
                    "price": menu_item["price"]
                }
            ]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        # Update status
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_response = requests.put(
            f"{BASE_URL}/api/orders/{order_id}",
            json={"status": "accepted", "estimated_time": 15},
            headers=headers
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "accepted"
        assert data["estimated_time"] == 15
        print(f"✅ Order status updated to 'accepted' with 15 min estimate")


class TestSettings:
    """Settings API tests"""
    
    def test_get_settings(self):
        """Test getting settings (public)"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "whatsapp_number" in data
        assert "phone" in data
        print(f"✅ Got settings, WhatsApp: {data['whatsapp_number']}")
    
    def test_settings_has_notification_sound_field(self):
        """Test settings has notification_sound_url field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # Field should exist (can be null)
        assert "notification_sound_url" in data
        print(f"✅ Settings has notification_sound_url field")


class TestCleanup:
    """Cleanup test orders"""
    
    def test_cleanup_test_orders(self):
        """Delete test orders created during testing"""
        # Get admin token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get all orders
        orders_response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        orders = orders_response.json()
        
        # Delete test orders (apartment starts with TEST-)
        deleted = 0
        for order in orders:
            if order.get("apartment_number", "").startswith("TEST-"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/orders/{order['id']}",
                    headers=headers
                )
                if delete_response.status_code == 200:
                    deleted += 1
        
        print(f"✅ Cleaned up {deleted} test orders")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
