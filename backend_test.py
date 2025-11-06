#!/usr/bin/env python3
"""
Backend API Testing Suite for size.ai Authentication and Configuration Management
Tests all authentication endpoints and CRUD operations for configurations
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://secsize-tool.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        self.saved_configs = []
        
    def log(self, message, level="INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_user_registration(self):
        """Test user registration endpoint"""
        self.log("Testing User Registration (POST /api/auth/register)")
        
        # Generate unique email for testing
        unique_id = str(uuid.uuid4())[:8]
        test_user = {
            "name": "Test User",
            "email": f"test{unique_id}@example.com",
            "password": "password123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=test_user)
            
            if response.status_code == 201:
                user_data = response.json()
                self.log(f"✅ Registration successful: {user_data}")
                
                # Verify response structure
                required_fields = ["id", "email", "name", "created_at"]
                for field in required_fields:
                    if field not in user_data:
                        self.log(f"❌ Missing field in response: {field}", "ERROR")
                        return False
                
                # Store user data for login test
                self.user_data = test_user
                return True
            else:
                self.log(f"❌ Registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Registration error: {str(e)}", "ERROR")
            return False
    
    def test_duplicate_registration(self):
        """Test duplicate email registration (should fail)"""
        self.log("Testing Duplicate Registration (should return 400)")
        
        if not self.user_data:
            self.log("❌ No user data available for duplicate test", "ERROR")
            return False
            
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=self.user_data)
            
            if response.status_code == 400:
                self.log("✅ Duplicate registration correctly rejected")
                return True
            else:
                self.log(f"❌ Expected 400, got {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Duplicate registration test error: {str(e)}", "ERROR")
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        self.log("Testing User Login (POST /api/auth/login)")
        
        if not self.user_data:
            self.log("❌ No user data available for login", "ERROR")
            return False
            
        login_data = {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                token_data = response.json()
                self.log(f"✅ Login successful: {token_data}")
                
                # Verify token structure
                if "access_token" in token_data and "token_type" in token_data:
                    if token_data["token_type"] == "bearer":
                        self.access_token = token_data["access_token"]
                        # Set authorization header for future requests
                        self.session.headers.update({
                            "Authorization": f"Bearer {self.access_token}"
                        })
                        return True
                    else:
                        self.log(f"❌ Invalid token type: {token_data['token_type']}", "ERROR")
                        return False
                else:
                    self.log("❌ Missing token fields in response", "ERROR")
                    return False
            else:
                self.log(f"❌ Login failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Login error: {str(e)}", "ERROR")
            return False
    
    def test_wrong_password_login(self):
        """Test login with wrong password (should fail)"""
        self.log("Testing Wrong Password Login (should return 401)")
        
        if not self.user_data:
            self.log("❌ No user data available", "ERROR")
            return False
            
        wrong_login = {
            "email": self.user_data["email"],
            "password": "wrongpassword"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=wrong_login)
            
            if response.status_code == 401:
                self.log("✅ Wrong password correctly rejected")
                return True
            else:
                self.log(f"❌ Expected 401, got {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Wrong password test error: {str(e)}", "ERROR")
            return False
    
    def test_nonexistent_user_login(self):
        """Test login with non-existent email (should fail)"""
        self.log("Testing Non-existent User Login (should return 401)")
        
        fake_login = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=fake_login)
            
            if response.status_code == 401:
                self.log("✅ Non-existent user correctly rejected")
                return True
            else:
                self.log(f"❌ Expected 401, got {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Non-existent user test error: {str(e)}", "ERROR")
            return False
    
    def test_get_current_user(self):
        """Test get current user endpoint"""
        self.log("Testing Get Current User (GET /api/auth/me)")
        
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 200:
                user_info = response.json()
                self.log(f"✅ Current user retrieved: {user_info}")
                
                # Verify user data matches registration
                if user_info["email"] == self.user_data["email"]:
                    return True
                else:
                    self.log(f"❌ Email mismatch: expected {self.user_data['email']}, got {user_info['email']}", "ERROR")
                    return False
            else:
                self.log(f"❌ Get current user failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Get current user error: {str(e)}", "ERROR")
            return False
    
    def test_invalid_token_access(self):
        """Test access with invalid token (should fail)"""
        self.log("Testing Invalid Token Access (should return 401)")
        
        # Save current token
        original_token = self.session.headers.get("Authorization")
        
        # Set invalid token
        self.session.headers.update({"Authorization": "Bearer invalid_token_here"})
        
        try:
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 401:
                self.log("✅ Invalid token correctly rejected")
                result = True
            else:
                self.log(f"❌ Expected 401, got {response.status_code}", "ERROR")
                result = False
                
            # Restore original token
            if original_token:
                self.session.headers.update({"Authorization": original_token})
            
            return result
                
        except Exception as e:
            self.log(f"❌ Invalid token test error: {str(e)}", "ERROR")
            # Restore original token
            if original_token:
                self.session.headers.update({"Authorization": original_token})
            return False
    
    def test_save_configuration(self):
        """Test save configuration endpoint"""
        self.log("Testing Save Configuration (POST /api/configurations)")
        
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
            
        config_data = {
            "name": "Production Config 2025",
            "description": "Main production environment",
            "devices": {
                "windowsWorkstations": {
                    "quantity": 100,
                    "eps": 3
                }
            },
            "configuration": {
                "retentionPeriod": 90
            },
            "results": {
                "totalEPS": 300,
                "totalDevices": 100
            }
        }
        
        try:
            response = self.session.post(f"{API_BASE}/configurations", json=config_data)
            
            if response.status_code == 201:
                saved_config = response.json()
                self.log(f"✅ Configuration saved: {saved_config}")
                
                # Verify response structure
                required_fields = ["id", "user_id", "name", "devices", "configuration", "results", "created_at", "updated_at"]
                for field in required_fields:
                    if field not in saved_config:
                        self.log(f"❌ Missing field in response: {field}", "ERROR")
                        return False
                
                # Store config ID for later tests
                self.saved_configs.append(saved_config)
                return True
            else:
                self.log(f"❌ Save configuration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Save configuration error: {str(e)}", "ERROR")
            return False
    
    def test_save_multiple_configurations(self):
        """Test saving multiple configurations"""
        self.log("Testing Save Multiple Configurations")
        
        configs = [
            {
                "name": "Development Config",
                "description": "Development environment setup",
                "devices": {"servers": {"quantity": 10, "eps": 5}},
                "configuration": {"retentionPeriod": 30},
                "results": {"totalEPS": 50, "totalDevices": 10}
            },
            {
                "name": "Staging Config",
                "description": "Staging environment setup",
                "devices": {"workstations": {"quantity": 50, "eps": 2}},
                "configuration": {"retentionPeriod": 60},
                "results": {"totalEPS": 100, "totalDevices": 50}
            }
        ]
        
        success_count = 0
        for i, config in enumerate(configs):
            try:
                response = self.session.post(f"{API_BASE}/configurations", json=config)
                if response.status_code == 201:
                    saved_config = response.json()
                    self.saved_configs.append(saved_config)
                    success_count += 1
                    self.log(f"✅ Configuration {i+1} saved successfully")
                else:
                    self.log(f"❌ Configuration {i+1} failed: {response.status_code}", "ERROR")
            except Exception as e:
                self.log(f"❌ Configuration {i+1} error: {str(e)}", "ERROR")
        
        return success_count == len(configs)
    
    def test_get_user_configurations(self):
        """Test get user configurations endpoint"""
        self.log("Testing Get User Configurations (GET /api/configurations)")
        
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/configurations")
            
            if response.status_code == 200:
                configs = response.json()
                self.log(f"✅ Retrieved {len(configs)} configurations")
                
                # Verify we have the expected number of configs
                expected_count = len(self.saved_configs)
                if len(configs) >= expected_count:
                    self.log(f"✅ Configuration count matches or exceeds expected ({expected_count})")
                    return True
                else:
                    self.log(f"❌ Expected at least {expected_count} configs, got {len(configs)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Get configurations failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Get configurations error: {str(e)}", "ERROR")
            return False
    
    def test_load_single_configuration(self):
        """Test load single configuration endpoint"""
        self.log("Testing Load Single Configuration (GET /api/configurations/{id})")
        
        if not self.saved_configs:
            self.log("❌ No saved configurations available", "ERROR")
            return False
            
        config_id = self.saved_configs[0]["id"]
        
        try:
            response = self.session.get(f"{API_BASE}/configurations/{config_id}")
            
            if response.status_code == 200:
                config = response.json()
                self.log(f"✅ Configuration loaded: {config['name']}")
                
                # Verify data matches saved config
                if config["id"] == config_id:
                    return True
                else:
                    self.log(f"❌ ID mismatch: expected {config_id}, got {config['id']}", "ERROR")
                    return False
            else:
                self.log(f"❌ Load configuration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Load configuration error: {str(e)}", "ERROR")
            return False
    
    def test_load_nonexistent_configuration(self):
        """Test loading non-existent configuration (should fail)"""
        self.log("Testing Load Non-existent Configuration (should return 404)")
        
        fake_id = str(uuid.uuid4())
        
        try:
            response = self.session.get(f"{API_BASE}/configurations/{fake_id}")
            
            if response.status_code == 404:
                self.log("✅ Non-existent configuration correctly rejected")
                return True
            else:
                self.log(f"❌ Expected 404, got {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Non-existent config test error: {str(e)}", "ERROR")
            return False
    
    def test_delete_configuration(self):
        """Test delete configuration endpoint"""
        self.log("Testing Delete Configuration (DELETE /api/configurations/{id})")
        
        if not self.saved_configs:
            self.log("❌ No saved configurations available", "ERROR")
            return False
            
        # Use the last saved config for deletion
        config_to_delete = self.saved_configs[-1]
        config_id = config_to_delete["id"]
        
        try:
            response = self.session.delete(f"{API_BASE}/configurations/{config_id}")
            
            if response.status_code == 204:
                self.log(f"✅ Configuration deleted: {config_to_delete['name']}")
                # Remove from our tracking list
                self.saved_configs.remove(config_to_delete)
                return True
            else:
                self.log(f"❌ Delete configuration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Delete configuration error: {str(e)}", "ERROR")
            return False
    
    def test_verify_deletion(self):
        """Test that deleted configuration is no longer accessible"""
        self.log("Testing Verify Configuration Deletion")
        
        # Get current configurations and verify count decreased
        try:
            response = self.session.get(f"{API_BASE}/configurations")
            
            if response.status_code == 200:
                configs = response.json()
                expected_count = len(self.saved_configs)
                
                if len(configs) == expected_count:
                    self.log(f"✅ Configuration count correctly decreased to {len(configs)}")
                    return True
                else:
                    self.log(f"❌ Expected {expected_count} configs, got {len(configs)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Verification failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Verification error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        self.log("=" * 60)
        self.log("STARTING BACKEND API TESTS FOR SIZE.AI")
        self.log(f"Backend URL: {BACKEND_URL}")
        self.log("=" * 60)
        
        tests = [
            ("User Registration", self.test_user_registration),
            ("Duplicate Registration", self.test_duplicate_registration),
            ("User Login", self.test_user_login),
            ("Wrong Password Login", self.test_wrong_password_login),
            ("Non-existent User Login", self.test_nonexistent_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Invalid Token Access", self.test_invalid_token_access),
            ("Save Configuration", self.test_save_configuration),
            ("Save Multiple Configurations", self.test_save_multiple_configurations),
            ("Get User Configurations", self.test_get_user_configurations),
            ("Load Single Configuration", self.test_load_single_configuration),
            ("Load Non-existent Configuration", self.test_load_nonexistent_configuration),
            ("Delete Configuration", self.test_delete_configuration),
            ("Verify Deletion", self.test_verify_deletion),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running: {test_name} ---")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
                    self.log(f"✅ {test_name}: PASSED")
                else:
                    self.log(f"❌ {test_name}: FAILED", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name}: EXCEPTION - {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("TEST SUMMARY")
        self.log("=" * 60)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED! Backend API is working correctly.")
            return True
        else:
            self.log(f"⚠️  {total - passed} tests failed. Backend needs attention.")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)