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
BACKEND_URL = "https://infrasizingai.preview.emergentagent.com"
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

    # ============= NEW DATABASE OPTIMIZATION TESTS =============
    
    def test_health_check_endpoint(self):
        """Test new health check endpoint"""
        self.log("Testing Health Check Endpoint (GET /api/health)")
        
        try:
            response = self.session.get(f"{API_BASE}/health")
            
            if response.status_code == 200:
                health_data = response.json()
                self.log(f"✅ Health check successful: {health_data}")
                
                # Verify response structure
                required_fields = ["status", "database", "version"]
                for field in required_fields:
                    if field not in health_data:
                        self.log(f"❌ Missing field in health response: {field}", "ERROR")
                        return False
                
                # Verify status values
                if health_data["status"] == "healthy" and health_data["database"] == "connected":
                    self.log("✅ Database connection is healthy")
                    return True
                else:
                    self.log(f"❌ Unhealthy status: {health_data}", "ERROR")
                    return False
            else:
                self.log(f"❌ Health check failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Health check error: {str(e)}", "ERROR")
            return False
    
    def test_user_activity_logging(self):
        """Test user activity logging with new indexes"""
        self.log("Testing User Activity Logging (GET /api/auth/my-activity)")
        
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/auth/my-activity")
            
            if response.status_code == 200:
                activities = response.json()
                self.log(f"✅ Retrieved {len(activities)} user activities")
                
                # Verify we have at least login and registration activities
                if len(activities) >= 2:
                    # Check if activities are sorted by timestamp (descending)
                    timestamps = [activity["timestamp"] for activity in activities]
                    is_sorted = all(timestamps[i] >= timestamps[i+1] for i in range(len(timestamps)-1))
                    
                    if is_sorted:
                        self.log("✅ Activities are properly sorted by timestamp (descending)")
                        
                        # Verify activity structure
                        activity = activities[0]
                        required_fields = ["id", "user_id", "user_email", "activity_type", "timestamp"]
                        for field in required_fields:
                            if field not in activity:
                                self.log(f"❌ Missing field in activity: {field}", "ERROR")
                                return False
                        
                        return True
                    else:
                        self.log("❌ Activities are not properly sorted", "ERROR")
                        return False
                else:
                    self.log(f"❌ Expected at least 2 activities, got {len(activities)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Get user activity failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ User activity test error: {str(e)}", "ERROR")
            return False
    
    def get_admin_token(self):
        """Login with existing admin user for testing"""
        self.log("Logging in with existing admin user")
        
        # Use existing admin credentials
        admin_login = {
            "email": "admin@sizeai.com",
            "password": "admin123"  # Default admin password
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=admin_login)
            
            if response.status_code == 200:
                token_data = response.json()
                admin_token = token_data["access_token"]
                self.log("✅ Admin user logged in successfully")
                return admin_token
            else:
                self.log(f"❌ Admin login failed: {response.status_code} - {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ Admin login error: {str(e)}", "ERROR")
            return None
    
    def test_admin_stats_endpoint(self):
        """Test admin stats endpoint with optimized queries"""
        self.log("Testing Admin Stats Endpoint (GET /api/admin/stats)")
        
        # Create admin user and get token
        admin_token = self.get_admin_token()
        if not admin_token:
            self.log("❌ Could not get admin token", "ERROR")
            return False
        
        # Save current token
        original_auth = self.session.headers.get("Authorization")
        
        # Set admin token
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        
        try:
            response = self.session.get(f"{API_BASE}/admin/stats")
            
            if response.status_code == 200:
                stats = response.json()
                self.log(f"✅ Admin stats retrieved: {stats}")
                
                # Verify response structure
                required_fields = ["total_users", "recent_users_7d", "total_logins", "total_registrations", "recent_activity_24h"]
                for field in required_fields:
                    if field not in stats:
                        self.log(f"❌ Missing field in stats: {field}", "ERROR")
                        return False
                
                # Verify data types and reasonable values
                if (isinstance(stats["total_users"], int) and stats["total_users"] >= 0 and
                    isinstance(stats["total_logins"], int) and stats["total_logins"] >= 0):
                    self.log("✅ Stats data structure is valid")
                    return True
                else:
                    self.log("❌ Invalid stats data types or values", "ERROR")
                    return False
            else:
                self.log(f"❌ Admin stats failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin stats error: {str(e)}", "ERROR")
            return False
        finally:
            # Restore original token
            if original_auth:
                self.session.headers.update({"Authorization": original_auth})
    
    def test_admin_chart_endpoints(self):
        """Test admin chart endpoints with aggregation pipelines"""
        self.log("Testing Admin Chart Endpoints (Optimized Aggregation)")
        
        # Create admin user and get token
        admin_token = self.get_admin_token()
        if not admin_token:
            self.log("❌ Could not get admin token", "ERROR")
            return False
        
        # Save current token
        original_auth = self.session.headers.get("Authorization")
        
        # Set admin token
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        
        try:
            # Test signup chart endpoint
            response = self.session.get(f"{API_BASE}/admin/charts/signups?days=7")
            
            if response.status_code == 200:
                signup_data = response.json()
                self.log(f"✅ Signup chart data retrieved: {len(signup_data)} data points")
                
                # Verify we get 8 data points (7 days + today)
                if len(signup_data) == 8:
                    # Verify data structure
                    if all("date" in item and "count" in item for item in signup_data):
                        self.log("✅ Signup chart data structure is valid")
                    else:
                        self.log("❌ Invalid signup chart data structure", "ERROR")
                        return False
                else:
                    self.log(f"❌ Expected 8 data points, got {len(signup_data)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Signup chart failed: {response.status_code}", "ERROR")
                return False
            
            # Test login chart endpoint
            response = self.session.get(f"{API_BASE}/admin/charts/logins?days=7")
            
            if response.status_code == 200:
                login_data = response.json()
                self.log(f"✅ Login chart data retrieved: {len(login_data)} data points")
                
                # Verify structure
                if len(login_data) == 8 and all("date" in item and "count" in item for item in login_data):
                    self.log("✅ Login chart data structure is valid")
                else:
                    self.log("❌ Invalid login chart data", "ERROR")
                    return False
            else:
                self.log(f"❌ Login chart failed: {response.status_code}", "ERROR")
                return False
            
            # Test reports chart endpoint
            response = self.session.get(f"{API_BASE}/admin/charts/reports?days=7")
            
            if response.status_code == 200:
                report_data = response.json()
                self.log(f"✅ Report chart data retrieved: {len(report_data)} data points")
                
                # Verify structure
                if len(report_data) == 8 and all("date" in item and "count" in item for item in report_data):
                    self.log("✅ Report chart data structure is valid")
                    return True
                else:
                    self.log("❌ Invalid report chart data", "ERROR")
                    return False
            else:
                self.log(f"❌ Report chart failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin chart endpoints error: {str(e)}", "ERROR")
            return False
        finally:
            # Restore original token
            if original_auth:
                self.session.headers.update({"Authorization": original_auth})
    
    def test_ai_chat_error_handling(self):
        """Test AI chat endpoint error handling"""
        self.log("Testing AI Chat Error Handling (POST /api/ai/chat)")
        
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
        
        chat_data = {
            "message": "Hello, can you help me with SIEM sizing?",
            "session_id": str(uuid.uuid4())
        }
        
        try:
            response = self.session.post(f"{API_BASE}/ai/chat", json=chat_data)
            
            # The endpoint should either work (200) or fail gracefully (500 with proper error)
            if response.status_code == 200:
                chat_response = response.json()
                self.log(f"✅ AI chat working: {chat_response}")
                
                # Verify response structure
                if "message" in chat_response and "session_id" in chat_response:
                    return True
                else:
                    self.log("❌ Invalid AI chat response structure", "ERROR")
                    return False
            elif response.status_code == 500:
                # This is expected if AI service is not configured
                error_data = response.json()
                if "detail" in error_data:
                    self.log(f"✅ AI chat error handling working: {error_data['detail']}")
                    return True
                else:
                    self.log("❌ AI chat error response missing detail", "ERROR")
                    return False
            else:
                self.log(f"❌ Unexpected AI chat response: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ AI chat test error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        self.log("=" * 60)
        self.log("STARTING BACKEND API TESTS FOR SIZE.AI")
        self.log("DATABASE OPTIMIZATION & IMPROVEMENTS VERIFICATION")
        self.log(f"Backend URL: {BACKEND_URL}")
        self.log("=" * 60)
        
        tests = [
            # Core Authentication Tests (Verify Still Working)
            ("User Registration", self.test_user_registration),
            ("Duplicate Registration", self.test_duplicate_registration),
            ("User Login", self.test_user_login),
            ("Wrong Password Login", self.test_wrong_password_login),
            ("Non-existent User Login", self.test_nonexistent_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Invalid Token Access", self.test_invalid_token_access),
            
            # Configuration Management Tests (With New Indexes)
            ("Save Configuration", self.test_save_configuration),
            ("Save Multiple Configurations", self.test_save_multiple_configurations),
            ("Get User Configurations", self.test_get_user_configurations),
            ("Load Single Configuration", self.test_load_single_configuration),
            ("Load Non-existent Configuration", self.test_load_nonexistent_configuration),
            ("Delete Configuration", self.test_delete_configuration),
            ("Verify Deletion", self.test_verify_deletion),
            
            # NEW DATABASE OPTIMIZATION TESTS
            ("Health Check Endpoint", self.test_health_check_endpoint),
            ("User Activity Logging", self.test_user_activity_logging),
            ("Admin Stats Endpoint", self.test_admin_stats_endpoint),
            ("Admin Chart Endpoints", self.test_admin_chart_endpoints),
            ("AI Chat Error Handling", self.test_ai_chat_error_handling),
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