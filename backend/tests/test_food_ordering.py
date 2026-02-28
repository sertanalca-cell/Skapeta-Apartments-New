"""
Backend API Tests for Food Service Ordering System
Tests: Menu CRUD, Order CRUD, Order Status Management
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"


class TestAuth:
    """Authentication tests"""
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        print("✓ Admin login successful")
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials rejected correctly")


class TestMenuCRUD:
    """Menu Items CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_menu_items_public(self):
        """Test getting menu items without auth (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/menu-items")
        assert response.status_code == 200, f"Failed to get menu items: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} menu items (public)")
    
    def test_get_available_menu_items_only(self):
        """Test getting only available menu items"""
        response = requests.get(f"{BASE_URL}/api/menu-items", params={"available_only": True})
        assert response.status_code == 200
        data = response.json()
        # All returned items should be available
        for item in data:
            assert item.get("available") == True, f"Item {item.get('name')} should be available"
        print(f"✓ Got {len(data)} available menu items")
    
    def test_create_menu_item(self):
        """Test creating a new menu item (admin only)"""
        menu_data = {
            "name": f"{TEST_PREFIX}Pizza Margherita",
            "description": "Classic Italian pizza with tomato and mozzarella",
            "price": 12.99,
            "category": "Main Course",
            "available": True
        }
        response = requests.post(f"{BASE_URL}/api/menu-items", json=menu_data, headers=self.headers)
        assert response.status_code == 200, f"Failed to create menu item: {response.text}"
        
        data = response.json()
        assert data["name"] == menu_data["name"]
        assert data["price"] == menu_data["price"]
        assert data["category"] == menu_data["category"]
        assert "id" in data
        
        # Verify with GET
        item_id = data["id"]
        get_response = requests.get(f"{BASE_URL}/api/menu-items/{item_id}")
        assert get_response.status_code == 200
        fetched_item = get_response.json()
        assert fetched_item["name"] == menu_data["name"]
        print(f"✓ Created menu item: {data['name']} with id {item_id}")
        
        # Store for cleanup
        self.created_item_id = item_id
        return item_id
    
    def test_create_menu_item_requires_auth(self):
        """Test that creating menu item requires authentication"""
        menu_data = {
            "name": f"{TEST_PREFIX}Unauthorized Item",
            "price": 5.00,
            "category": "Test"
        }
        response = requests.post(f"{BASE_URL}/api/menu-items", json=menu_data)
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Menu creation requires authentication")
    
    def test_update_menu_item(self):
        """Test updating a menu item"""
        # First create an item
        menu_data = {
            "name": f"{TEST_PREFIX}Item to Update",
            "price": 10.00,
            "category": "Main Course",
            "available": True
        }
        create_response = requests.post(f"{BASE_URL}/api/menu-items", json=menu_data, headers=self.headers)
        item_id = create_response.json()["id"]
        
        # Update the item
        update_data = {
            "name": f"{TEST_PREFIX}Updated Item Name",
            "price": 15.99,
            "available": False
        }
        update_response = requests.put(f"{BASE_URL}/api/menu-items/{item_id}", json=update_data, headers=self.headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated_item = update_response.json()
        assert updated_item["name"] == update_data["name"]
        assert updated_item["price"] == update_data["price"]
        assert updated_item["available"] == False
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/menu-items/{item_id}")
        fetched = get_response.json()
        assert fetched["price"] == 15.99
        print(f"✓ Updated menu item: {item_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/menu-items/{item_id}", headers=self.headers)
    
    def test_delete_menu_item(self):
        """Test deleting a menu item"""
        # Create item to delete
        menu_data = {
            "name": f"{TEST_PREFIX}Item to Delete",
            "price": 8.00,
            "category": "Test"
        }
        create_response = requests.post(f"{BASE_URL}/api/menu-items", json=menu_data, headers=self.headers)
        item_id = create_response.json()["id"]
        
        # Delete the item
        delete_response = requests.delete(f"{BASE_URL}/api/menu-items/{item_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        # Verify item no longer exists
        get_response = requests.get(f"{BASE_URL}/api/menu-items/{item_id}")
        assert get_response.status_code == 404
        print(f"✓ Deleted menu item: {item_id}")
    
    def test_get_nonexistent_menu_item(self):
        """Test getting a menu item that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/menu-items/nonexistent-id-12345")
        assert response.status_code == 404
        print("✓ 404 returned for nonexistent menu item")


class TestOrderCRUD:
    """Order CRUD and status management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token and create test menu item"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create a test menu item for orders
        menu_data = {
            "name": f"{TEST_PREFIX}Order Test Item",
            "price": 10.00,
            "category": "Main Course",
            "available": True
        }
        create_response = requests.post(f"{BASE_URL}/api/menu-items", json=menu_data, headers=self.headers)
        if create_response.status_code == 200:
            self.test_menu_item = create_response.json()
        else:
            self.test_menu_item = {"id": "test-item", "name": "Test Item", "price": 10.00}
    
    def test_create_order_public(self):
        """Test creating an order (public endpoint for customers)"""
        order_data = {
            "customer_name": f"{TEST_PREFIX}John Doe",
            "apartment_number": "A-101",
            "notes": "Please deliver to door",
            "items": [
                {
                    "menu_item_id": self.test_menu_item.get("id", "test-item"),
                    "menu_item_name": self.test_menu_item.get("name", "Test Item"),
                    "quantity": 2,
                    "price": 10.00
                }
            ]
        }
        
        # No auth required for creating orders
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200, f"Failed to create order: {response.text}"
        
        data = response.json()
        assert data["customer_name"] == order_data["customer_name"]
        assert data["apartment_number"] == "A-101"
        assert data["status"] == "pending"
        assert data["total_price"] == 20.00  # 2 * 10.00
        assert "id" in data
        
        print(f"✓ Created order with id {data['id']}, total: €{data['total_price']}")
        return data["id"]
    
    def test_get_order_by_id(self):
        """Test getting a single order (public for tracking)"""
        # Create an order first
        order_id = self.test_create_order_public()
        
        # Get the order
        response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        print(f"✓ Retrieved order {order_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=self.headers)
    
    def test_get_all_orders_requires_auth(self):
        """Test that getting all orders requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Getting all orders requires authentication")
    
    def test_get_all_orders_admin(self):
        """Test admin getting all orders"""
        response = requests.get(f"{BASE_URL}/api/orders", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} orders")
    
    def test_get_orders_by_apartment(self):
        """Test getting orders by apartment number (for customer tracking)"""
        # Create an order for specific apartment
        order_data = {
            "customer_name": f"{TEST_PREFIX}Jane Doe",
            "apartment_number": "B-202",
            "items": [
                {
                    "menu_item_id": "test-item",
                    "menu_item_name": "Test Item",
                    "quantity": 1,
                    "price": 10.00
                }
            ]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        # Get orders by apartment
        response = requests.get(f"{BASE_URL}/api/orders/customer/B-202")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(o["apartment_number"] == "B-202" for o in data)
        print(f"✓ Retrieved {len(data)} orders for apartment B-202")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=self.headers)
    
    def test_update_order_status_accepted(self):
        """Test accepting an order with estimated time"""
        # Create order
        order_data = {
            "customer_name": f"{TEST_PREFIX}Status Test",
            "apartment_number": "C-303",
            "items": [{"menu_item_id": "test", "menu_item_name": "Test", "quantity": 1, "price": 10.00}]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        # Accept order with 15 minutes estimated time
        update_data = {"status": "accepted", "estimated_time": 15}
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}", json=update_data, headers=self.headers)
        assert response.status_code == 200, f"Status update failed: {response.text}"
        
        data = response.json()
        assert data["status"] == "accepted"
        assert data["estimated_time"] == 15
        print(f"✓ Order accepted with 15 min estimated time")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=self.headers)
    
    def test_order_status_flow(self):
        """Test full order status progression: pending -> accepted -> preparing -> on_the_way -> delivered"""
        # Create order
        order_data = {
            "customer_name": f"{TEST_PREFIX}Flow Test",
            "apartment_number": "D-404",
            "items": [{"menu_item_id": "test", "menu_item_name": "Test", "quantity": 1, "price": 10.00}]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        statuses = [
            ("accepted", 20),
            ("preparing", None),
            ("on_the_way", None),
            ("delivered", None)
        ]
        
        for status, est_time in statuses:
            update_data = {"status": status}
            if est_time:
                update_data["estimated_time"] = est_time
            
            response = requests.put(f"{BASE_URL}/api/orders/{order_id}", json=update_data, headers=self.headers)
            assert response.status_code == 200, f"Failed to update to {status}: {response.text}"
            
            # Verify
            get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
            assert get_response.json()["status"] == status
            print(f"  ✓ Status updated to: {status}")
        
        print("✓ Complete order status flow tested")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=self.headers)
    
    def test_delete_order(self):
        """Test deleting an order"""
        # Create order
        order_data = {
            "customer_name": f"{TEST_PREFIX}Delete Test",
            "apartment_number": "E-505",
            "items": [{"menu_item_id": "test", "menu_item_name": "Test", "quantity": 1, "price": 10.00}]
        }
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=self.headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response.status_code == 404
        print(f"✓ Order {order_id} deleted successfully")
    
    def test_get_nonexistent_order(self):
        """Test getting an order that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/orders/nonexistent-order-12345")
        assert response.status_code == 404
        print("✓ 404 returned for nonexistent order")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@skapeta.com",
            "password": "admin123"
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_cleanup_test_menu_items(self):
        """Clean up TEST_ prefixed menu items"""
        response = requests.get(f"{BASE_URL}/api/menu-items", headers=self.headers)
        items = response.json()
        
        deleted_count = 0
        for item in items:
            if item.get("name", "").startswith(TEST_PREFIX):
                requests.delete(f"{BASE_URL}/api/menu-items/{item['id']}", headers=self.headers)
                deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test menu items")
    
    def test_cleanup_test_orders(self):
        """Clean up TEST_ prefixed orders"""
        response = requests.get(f"{BASE_URL}/api/orders", headers=self.headers)
        orders = response.json()
        
        deleted_count = 0
        for order in orders:
            if order.get("customer_name", "").startswith(TEST_PREFIX):
                requests.delete(f"{BASE_URL}/api/orders/{order['id']}", headers=self.headers)
                deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test orders")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
