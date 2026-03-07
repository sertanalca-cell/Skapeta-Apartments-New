"""
Backend API Tests for WhatsApp Order Notification Flow
Tests: Settings API, Customer Auth, Order Creation, WhatsApp Number Verification
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected WhatsApp number
EXPECTED_WHATSAPP = "00355693227207"  # User requirement
EXPECTED_WHATSAPP_ALT = "+355693227207"  # Alternative format with +

class TestSettingsWhatsApp:
    """Settings API tests focused on WhatsApp number"""
    
    def test_settings_returns_whatsapp_number(self):
        """Verify settings API returns WhatsApp number"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Settings API failed: {response.text}"
        
        data = response.json()
        assert "whatsapp_number" in data, "WhatsApp number missing from settings"
        
        whatsapp = data["whatsapp_number"]
        print(f"✓ Settings returned whatsapp_number: {whatsapp}")
        
        # Clean the number for comparison (remove +, spaces, dashes)
        clean_whatsapp = whatsapp.replace("+", "").replace(" ", "").replace("-", "")
        expected_clean = EXPECTED_WHATSAPP.replace("+", "").replace(" ", "").replace("-", "")
        
        assert clean_whatsapp == expected_clean or whatsapp == EXPECTED_WHATSAPP_ALT, \
            f"WhatsApp number mismatch: got {whatsapp}, expected {EXPECTED_WHATSAPP} or {EXPECTED_WHATSAPP_ALT}"
        print(f"✓ WhatsApp number matches expected: {EXPECTED_WHATSAPP}")


class TestCustomerAuth:
    """Customer registration and login tests"""
    
    def test_customer_register(self):
        """Test customer registration with first name, last name, phone"""
        customer_data = {
            "first_name": "TEST_John",
            "last_name": "Doe",
            "phone": "+1234567890"
        }
        
        response = requests.post(f"{BASE_URL}/api/customer/register", json=customer_data)
        assert response.status_code == 200, f"Customer registration failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Customer ID missing from response"
        assert data["first_name"] == customer_data["first_name"]
        assert data["last_name"] == customer_data["last_name"]
        print(f"✓ Customer registered: {data['first_name']} {data['last_name']} (ID: {data['id']})")
        return data
    
    def test_customer_login(self):
        """Test customer login with first name and last name"""
        # First register
        register_data = {
            "first_name": "TEST_Login",
            "last_name": "User"
        }
        requests.post(f"{BASE_URL}/api/customer/register", json=register_data)
        
        # Then login
        login_data = {
            "first_name": "TEST_Login",
            "last_name": "User"
        }
        response = requests.post(f"{BASE_URL}/api/customer/login", json=login_data)
        assert response.status_code == 200, f"Customer login failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        print(f"✓ Customer logged in: {data['first_name']} {data['last_name']}")
        return data


class TestMenuAvailability:
    """Menu browsing tests"""
    
    def test_get_available_menu_items(self):
        """Test that available menu items can be fetched"""
        response = requests.get(f"{BASE_URL}/api/menu-items", params={"available_only": True})
        assert response.status_code == 200, f"Menu API failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Menu items should be a list"
        assert len(data) > 0, "No menu items available for testing"
        
        # Verify all items have required fields
        for item in data:
            assert "id" in item, "Menu item missing ID"
            assert "name" in item, "Menu item missing name"
            assert "price" in item, "Menu item missing price"
            assert item.get("available") == True, f"Item {item.get('name')} should be available"
        
        print(f"✓ Got {len(data)} available menu items")
        return data


class TestOrderCreationWithWhatsApp:
    """Order creation tests for WhatsApp notification flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Register a customer and get menu item"""
        # Register customer
        customer_data = {
            "first_name": "TEST_Order",
            "last_name": "Customer",
            "phone": "+355691234567"
        }
        response = requests.post(f"{BASE_URL}/api/customer/register", json=customer_data)
        self.customer = response.json()
        
        # Get a menu item
        menu_response = requests.get(f"{BASE_URL}/api/menu-items", params={"available_only": True})
        menu_items = menu_response.json()
        self.menu_item = menu_items[0] if menu_items else {"id": "test", "name": "Test", "price": 10.0}
        
        # Admin auth for cleanup
        auth_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        self.admin_token = auth_response.json().get("access_token")
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_create_order_for_whatsapp(self):
        """Test order creation - order should have all fields needed for WhatsApp message"""
        order_data = {
            "user_id": self.customer["id"],
            "first_name": "TEST_WhatsApp",
            "last_name": "Order",
            "phone": "+355691234567",
            "apartment_number": "A-101",
            "notes": "Test order for WhatsApp notification",
            "items": [
                {
                    "menu_item_id": self.menu_item["id"],
                    "menu_item_name": self.menu_item["name"],
                    "quantity": 2,
                    "price": self.menu_item["price"]
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200, f"Order creation failed: {response.text}"
        
        data = response.json()
        
        # Verify all fields needed for WhatsApp message
        assert "id" in data, "Order ID missing"
        assert "order_number" in data, "Order number missing"
        assert "first_name" in data, "First name missing"
        assert "last_name" in data, "Last name missing"
        assert "phone" in data, "Phone missing"
        assert "apartment_number" in data, "Apartment number missing"
        assert "items" in data, "Items missing"
        assert "total_price" in data, "Total price missing"
        assert "notes" in data, "Notes missing"
        assert "status" in data, "Status missing"
        
        # Verify correct values
        assert data["status"] == "pending", f"Expected pending status, got {data['status']}"
        assert data["total_price"] == self.menu_item["price"] * 2, f"Incorrect total price"
        
        print(f"✓ Order created successfully:")
        print(f"  - Order Number: {data.get('order_number')}")
        print(f"  - Customer: {data['first_name']} {data['last_name']}")
        print(f"  - Phone: {data['phone']}")
        print(f"  - Room: {data['apartment_number']}")
        print(f"  - Items: {len(data['items'])} items")
        print(f"  - Total: €{data['total_price']:.2f}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{data['id']}", headers=self.admin_headers)
        
        return data
    
    def test_order_items_format(self):
        """Verify order items have correct format for WhatsApp message formatting"""
        order_data = {
            "user_id": self.customer["id"],
            "first_name": "TEST_Items",
            "last_name": "Format",
            "phone": "+355699999999",
            "apartment_number": "B-202",
            "items": [
                {
                    "menu_item_id": self.menu_item["id"],
                    "menu_item_name": self.menu_item["name"],
                    "quantity": 3,
                    "price": self.menu_item["price"]
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify items structure
        items = data["items"]
        assert len(items) == 1
        
        item = items[0]
        assert "menu_item_name" in item, "Item name missing for WhatsApp formatting"
        assert "quantity" in item, "Quantity missing"
        assert "price" in item, "Price missing"
        
        # Verify WhatsApp message can be formatted
        item_line = f"{item['menu_item_name']} x{item['quantity']} - €{(item['price'] * item['quantity']):.2f}"
        print(f"✓ Item line for WhatsApp: {item_line}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{data['id']}", headers=self.admin_headers)


class TestWhatsAppURLConstruction:
    """Test WhatsApp URL construction logic (mirrors frontend)"""
    
    def test_whatsapp_url_format(self):
        """Verify WhatsApp URL can be correctly constructed from order data"""
        # Get settings
        settings_response = requests.get(f"{BASE_URL}/api/settings")
        settings = settings_response.json()
        
        # Clean WhatsApp number
        whatsapp_number = settings["whatsapp_number"].replace("+", "").replace(" ", "").replace("-", "")
        
        # Mock order data (as returned by API)
        order = {
            "order_number": 1001,
            "first_name": "Test",
            "last_name": "User",
            "phone": "+355691234567",
            "apartment_number": "A-101",
            "items": [
                {"menu_item_name": "Pizza", "quantity": 2, "price": 10.0}
            ],
            "total_price": 20.0,
            "notes": "Extra cheese"
        }
        
        # Construct WhatsApp URL (mirrors frontend logic)
        items_text = "%0A".join([
            f"{idx + 1}. {item['menu_item_name']} x{item['quantity']} - €{(item['price'] * item['quantity']):.2f}"
            for idx, item in enumerate(order["items"])
        ])
        
        message = (
            f"🔔 *YENİ SİPARİŞ / NEW ORDER*%0A%0A"
            f"📋 Sipariş No / Order #: *{order['order_number']}*%0A"
            f"👤 Müşteri / Customer: *{order['first_name']} {order['last_name']}*%0A"
            f"📞 Telefon / Phone: {order['phone'] or 'N/A'}%0A"
            f"🏠 Oda No / Room: *{order['apartment_number']}*%0A%0A"
            f"━━━━━━━━━━━━━━━━━━━━━━%0A"
            f"🍽️ *SİPARİŞ / ORDER:*%0A%0A"
            f"{items_text}%0A%0A"
            f"━━━━━━━━━━━━━━━━━━━━━━%0A%0A"
            f"💰 *TOPLAM / TOTAL: €{order['total_price']:.2f}*%0A%0A"
            f"📝 Notlar / Notes: {order['notes'] or 'Yok / None'}"
        )
        
        whatsapp_url = f"https://wa.me/{whatsapp_number}?text={message}"
        
        # Verify URL is correct format
        assert whatsapp_url.startswith("https://wa.me/"), "WhatsApp URL should start with https://wa.me/"
        assert whatsapp_number in whatsapp_url, f"WhatsApp number {whatsapp_number} should be in URL"
        assert "text=" in whatsapp_url, "WhatsApp URL should contain text parameter"
        
        print(f"✓ WhatsApp URL constructed successfully:")
        print(f"  - Number: {whatsapp_number}")
        print(f"  - URL: {whatsapp_url[:100]}...")
        
        # Verify no encoding issues with special characters
        assert "%0A" in whatsapp_url, "Line breaks should be URL encoded as %0A"


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_cleanup_test_orders(self):
        """Clean up TEST_ prefixed orders"""
        response = requests.get(f"{BASE_URL}/api/orders", headers=self.headers)
        if response.status_code != 200:
            print("✓ No orders to cleanup (access denied or empty)")
            return
            
        orders = response.json()
        deleted_count = 0
        for order in orders:
            if order.get("first_name", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/orders/{order['id']}", headers=self.headers)
                deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test orders")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
