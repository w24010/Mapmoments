import requests
import sys
import json
import time
from datetime import datetime
import tempfile
import os

class MapMomentsAPITester:
    def __init__(self, base_url="https://spotshare-18.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers={k: v for k, v in headers.items() if k != 'Content-Type'})
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test user registration
        timestamp = int(time.time())
        test_user = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {test_user['username']}")
        else:
            print("❌ Registration failed - stopping auth tests")
            return False

        # Test login
        login_data = {
            "email": test_user['email'],
            "password": test_user['password']
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if response and 'token' in response:
            self.token = response['token']
            print(f"   Login successful")
        else:
            print("❌ Login failed")
            return False

        # Test get current user
        response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if response:
            print(f"   Current user: {response.get('username')}")
        
        return True

    def test_pin_operations(self):
        """Test pin CRUD operations"""
        print("\n📍 Testing Pin Operations...")
        
        if not self.token:
            print("❌ No auth token - skipping pin tests")
            return False

        # Create a pin
        pin_data = {
            "title": "Test Pin Location",
            "description": "This is a test pin created by automated testing",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "privacy": "public"
        }
        
        response = self.run_test(
            "Create Pin",
            "POST",
            "pins",
            200,
            data=pin_data
        )
        
        if not response or 'id' not in response:
            print("❌ Pin creation failed - skipping remaining pin tests")
            return False
        
        pin_id = response['id']
        print(f"   Created pin: {pin_id}")

        # Get all pins
        response = self.run_test(
            "Get All Pins",
            "GET",
            "pins",
            200
        )
        
        if response:
            print(f"   Retrieved {len(response)} pins")

        # Get specific pin
        response = self.run_test(
            "Get Specific Pin",
            "GET",
            f"pins/{pin_id}",
            200
        )
        
        if response:
            print(f"   Retrieved pin: {response.get('title')}")

        # Test pin privacy
        private_pin_data = {
            "title": "Private Test Pin",
            "description": "This is a private test pin",
            "latitude": 37.7849,
            "longitude": -122.4094,
            "privacy": "private"
        }
        
        response = self.run_test(
            "Create Private Pin",
            "POST",
            "pins",
            200,
            data=private_pin_data
        )

        return pin_id

    def test_like_system(self, pin_id):
        """Test pin like functionality"""
        print("\n❤️ Testing Like System...")
        
        if not pin_id:
            print("❌ No pin ID - skipping like tests")
            return False

        # Like a pin
        response = self.run_test(
            "Like Pin",
            "POST",
            f"pins/{pin_id}/like",
            200
        )
        
        if response:
            print(f"   Pin liked - likes: {response.get('likes', 0)}")

        # Unlike the pin (like again)
        response = self.run_test(
            "Unlike Pin",
            "POST",
            f"pins/{pin_id}/like",
            200
        )
        
        if response:
            print(f"   Pin unliked - likes: {response.get('likes', 0)}")

        return True

    def test_comment_system(self, pin_id):
        """Test pin comment functionality"""
        print("\n💬 Testing Comment System...")
        
        if not pin_id:
            print("❌ No pin ID - skipping comment tests")
            return False

        # Add a comment
        comment_data = {
            "text": "This is a test comment from automated testing!"
        }
        
        response = self.run_test(
            "Add Comment",
            "POST",
            f"pins/{pin_id}/comments",
            200,
            data=comment_data
        )
        
        if response:
            print(f"   Comment added: {response.get('text', '')[:50]}...")

        return True

    def test_media_upload(self, pin_id):
        """Test media upload functionality"""
        print("\n📸 Testing Media Upload...")
        
        if not pin_id:
            print("❌ No pin ID - skipping media tests")
            return False

        # Create a simple test image file
        try:
            # Create a minimal test image (1x1 pixel PNG)
            test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
            
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(test_image_data)
                tmp_file_path = tmp_file.name

            # Upload media
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test.png', f, 'image/png')}
                data = {'caption': 'Test image upload'}
                
                response = self.run_test(
                    "Upload Media",
                    "POST",
                    f"pins/{pin_id}/media",
                    200,
                    data=data,
                    files=files
                )
            
            # Clean up
            os.unlink(tmp_file_path)
            
            if response:
                print(f"   Media uploaded: {response.get('media_type', 'unknown')}")

            # Get media for pin
            response = self.run_test(
                "Get Pin Media",
                "GET",
                f"pins/{pin_id}/media",
                200
            )
            
            if response:
                print(f"   Retrieved {len(response)} media items")

        except Exception as e:
            self.log_test("Upload Media", False, f"Exception: {str(e)}")

        return True

    def test_friend_system(self):
        """Test friend system functionality"""
        print("\n👥 Testing Friend System...")
        
        if not self.token:
            print("❌ No auth token - skipping friend tests")
            return False

        # Create a second user for friend testing
        timestamp = int(time.time())
        friend_user = {
            "username": f"friend_{timestamp}",
            "email": f"friend_{timestamp}@example.com",
            "password": "FriendPass123!"
        }
        
        response = self.run_test(
            "Register Friend User",
            "POST",
            "auth/register",
            200,
            data=friend_user
        )
        
        if not response or 'user' not in response:
            print("❌ Friend user registration failed - skipping friend tests")
            return False
        
        friend_id = response['user']['id']
        print(f"   Created friend user: {friend_user['username']}")

        # Search for users
        response = self.run_test(
            "Search Users",
            "GET",
            f"users/search?q={friend_user['username']}",
            200
        )
        
        if response:
            print(f"   Found {len(response)} users in search")

        # Send friend request
        response = self.run_test(
            "Send Friend Request",
            "POST",
            f"friends/request/{friend_id}",
            200
        )
        
        if response:
            print(f"   Friend request sent")

        # Get friends list (should be empty)
        response = self.run_test(
            "Get Friends List",
            "GET",
            "friends",
            200
        )
        
        if response:
            print(f"   Current friends: {len(response)}")

        # Get friend requests (should be empty for current user)
        response = self.run_test(
            "Get Friend Requests",
            "GET",
            "friends/requests",
            200
        )
        
        if response:
            print(f"   Pending requests: {len(response)}")

        return True

    def test_discovery_features(self):
        """Test discovery functionality"""
        print("\n🔍 Testing Discovery Features...")
        
        if not self.token:
            print("❌ No auth token - skipping discovery tests")
            return False

        # Get trending pins
        response = self.run_test(
            "Get Trending Pins",
            "GET",
            "discover/trending",
            200
        )
        
        if response:
            print(f"   Found {len(response)} trending pins")

        # Get nearby pins
        response = self.run_test(
            "Get Nearby Pins",
            "GET",
            "discover/nearby?lat=37.7749&lng=-122.4194&radius_km=10",
            200
        )
        
        if response:
            print(f"   Found {len(response)} nearby pins")

        return True

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting MapMoments API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test authentication
        if not self.test_auth_flow():
            print("❌ Authentication failed - stopping tests")
            return False

        # Test pin operations
        pin_id = self.test_pin_operations()
        
        if pin_id:
            # Test like system
            self.test_like_system(pin_id)
            
            # Test comment system
            self.test_comment_system(pin_id)
            
            # Test media upload
            self.test_media_upload(pin_id)

        # Test friend system
        self.test_friend_system()
        
        # Test discovery features
        self.test_discovery_features()

        # Print final results
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MapMomentsAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())