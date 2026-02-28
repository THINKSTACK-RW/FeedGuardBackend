const express = require('express');
const router = express.Router();

// API Documentation Data
const apiDocumentation = {
  title: "FeedGuard API Documentation",
  version: "1.0.0",
  baseUrl: "/api",
  description: "Complete API documentation for FeedGuard Food Security Monitoring System",
  categories: [
    {
      name: "Dashboard",
      icon: "📊",
      description: "Dashboard statistics and analytics endpoints",
      endpoints: [
        {
          method: "GET",
          path: "/dashboard/stats",
          description: "Get dashboard statistics including total households, critical alerts, and average meals",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Dashboard statistics retrieved successfully",
              example: {
                totalHouseholds: 8942,
                criticalAlerts: 145,
                avgMealsPerDay: 2.1,
                recentResponses: 1234,
                growth: "+12%"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/dashboard/trends",
          description: "Get trends data for charts with time period filter",
          parameters: [
            {
              name: "period",
              type: "query",
              required: false,
              enum: ["7d", "30d", "90d"],
              default: "30d",
              description: "Time window for data aggregation"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Trend data retrieved successfully",
              example: [
                {
                  name: "Mon",
                  stable: 45,
                  atRisk: 12,
                  critical: 5
                },
                {
                  name: "Tue", 
                  stable: 42,
                  atRisk: 15,
                  critical: 8
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/dashboard/regions",
          description: "Get regional breakdown with household counts and risk levels",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Regional breakdown retrieved successfully",
              example: [
                {
                  region: "Kibera District",
                  households: "2453",
                  risk: "Critical",
                  trend: "up",
                  status: "Action Req",
                  critical: 450,
                  atRisk: 890,
                  stable: 1113
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/dashboard/meal-frequency",
          description: "Get meal frequency analysis distribution",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Meal frequency data retrieved successfully",
              example: [
                {
                  name: "0 Meals",
                  value: 5,
                  fill: "#ef4444"
                },
                {
                  name: "1 Meal",
                  value: 15,
                  fill: "#f59e0b"
                },
                {
                  name: "2 Meals",
                  value: 45,
                  fill: "#10b981"
                },
                {
                  name: "3+ Meals",
                  value: 35,
                  fill: "#3b82f6"
                }
              ]
            }
          }
        }
      ]
    },
    {
      name: "Alerts",
      icon: "🚨",
      description: "Alert management and notification system",
      endpoints: [
        {
          method: "GET",
          path: "/alerts",
          description: "Get alerts with optional status and severity filters",
          parameters: [
            {
              name: "status",
              type: "query",
              required: false,
              enum: ["new", "investigating", "resolved"],
              description: "Filter by alert status"
            },
            {
              name: "severity",
              type: "query", 
              required: false,
              enum: ["critical", "warning", "info"],
              description: "Filter by alert severity"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Alerts retrieved successfully",
              example: [
                {
                  id: "alert-uuid-123",
                  region: "Kibera District",
                  type: "Critical",
                  message: "Severe food shortage reported by 45% of households",
                  time: "10 mins ago",
                  affected: 450,
                  status: "new"
                }
              ]
            }
          }
        },
        {
          method: "POST",
          path: "/alerts/{id}/dismiss",
          description: "Dismiss an alert by marking it as resolved",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Alert UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Alert dismissed successfully",
              example: {
                id: "alert-uuid-123",
                status: "resolved",
                resolved_at: "2026-01-07T10:30:00Z"
              }
            }
          }
        },
        {
          method: "POST",
          path: "/alerts/{id}/action",
          description: "Take action on an alert",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Alert UUID"
            }
          ],
          requestBody: {
            description: "Action to take on alert",
            required: true,
            example: {
              action: "investigate"
            }
          },
          responses: {
            200: {
              description: "Action taken successfully",
              example: {
                id: "alert-uuid-123",
                status: "investigating",
                updated_at: "2026-01-07T10:30:00Z"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/alerts/stats",
          description: "Get alert statistics and counts by severity",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Alert statistics retrieved successfully",
              example: {
                total: 50,
                critical: 15,
                warning: 25,
                info: 10,
                resolved: 20,
                active: 30
              }
            }
          }
        },
        {
          method: "POST",
          path: "/alerts/generate",
          description: "Generate alerts based on food security responses",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Alerts generated successfully",
              example: {
                message: "Generated 5 new alerts from critical responses",
                count: 5
              }
            }
          }
        }
      ]
    },
    {
      name: "Reports",
      icon: "📈",
      description: "Detailed reports, insights, and export functionality",
      endpoints: [
        {
          method: "GET",
          path: "/reports/summary",
          description: "Get report summary with region and date range filters",
          parameters: [
            {
              name: "region_id",
              type: "query",
              required: false,
              description: "Filter by specific region UUID"
            },
            {
              name: "date_range",
              type: "query",
              required: false,
              enum: ["7d", "30d", "90d"],
              default: "30d",
              description: "Time range for report data"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Report summary retrieved successfully",
              example: {
                totalReports: 8,
                critical: 3,
                warning: 4,
                stable: 2,
                avgCompleteness: 82
              }
            }
          }
        },
        {
          method: "GET",
          path: "/reports/detailed",
          description: "Get detailed reports with filtering options",
          parameters: [
            {
              name: "region_id",
              type: "query",
              required: false,
              description: "Filter by specific region UUID"
            },
            {
              name: "status",
              type: "query",
              required: false,
              enum: ["critical", "warning", "stable"],
              description: "Filter by risk status"
            },
            {
              name: "date_range",
              type: "query",
              required: false,
              enum: ["7d", "30d", "90d"],
              description: "Time range for report data"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Detailed reports retrieved successfully",
              example: [
                {
                  id: "RPT-001",
                  region: "Kibera District",
                  date: "2026-01-07",
                  time: "09:23 AM",
                  households: 245,
                  reporting: 189,
                  stable: 111,
                  atRisk: 89,
                  critical: 45,
                  status: "critical",
                  trend: "up",
                  completeness: 77
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/reports/export",
          description: "Export reports in CSV or PDF format",
          parameters: [
            {
              name: "format",
              type: "query",
              required: true,
              enum: ["csv", "pdf"],
              description: "Export format"
            },
            {
              name: "region_id",
              type: "query",
              required: false,
              description: "Filter by specific region UUID"
            },
            {
              name: "date_range",
              type: "query",
              required: false,
              enum: ["7d", "30d", "90d"],
              description: "Time range for export data"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Export completed successfully",
              example: "CSV file download or PDF data"
            }
          }
        },
        {
          method: "GET",
          path: "/reports/insights",
          description: "Get insights and predictions based on data analysis",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Insights retrieved successfully",
              example: {
                totalHouseholds: 2543,
                avgMealsPerDay: 2.4,
                criticalAlerts: 145,
                prediction: "Improving Trend",
                predictionText: "Based on current data, food security is expected to stabilize over the next 30 days"
              }
            }
          }
        }
      ]
    },
    {
      name: "Map",
      icon: "🗺️",
      description: "Geographic data and regional information",
      endpoints: [
        {
          method: "GET",
          path: "/map/regions",
          description: "Get map regions with coordinates and status information",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Map regions retrieved successfully",
              example: [
                {
                  id: 1,
                  x: 200,
                  y: 150,
                  region: "Kibera",
                  status: "critical",
                  households: 450,
                  risk: "High",
                  mealsPerDay: 1.2,
                  daysOfFood: 3
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/map/regions/{id}/details",
          description: "Get detailed information for a specific region",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Region ID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Region details retrieved successfully",
              example: {
                id: 1,
                region: "Kibera District",
                coordinates: { lat: -1.2921, lng: 36.8219 },
                status: "critical",
                households: 450,
                riskLevel: "High",
                lastUpdated: "2026-01-07T10:30:00Z"
              }
            }
          }
        }
      ]
    },
    {
      name: "Food Reports",
      icon: "🍎",
      description: "Mobile app food security reporting",
      endpoints: [
        {
          method: "POST",
          path: "/food-reports",
          description: "Submit a new food report from mobile app",
          parameters: [],
          requestBody: {
            description: "Food report data from citizen",
            required: true,
            example: {
              citizen_id: "citizen-uuid-123",
              meals_per_day: 2,
              days_of_food_left: 3,
              food_change_type: "none",
              shocks_experienced: ["income"],
              channel: "APP"
            }
          },
          responses: {
            201: {
              description: "Food report created successfully",
              example: {
                message: "Food report submitted successfully",
                response: {
                  id: "response-uuid-123",
                  food_security_score: 75,
                  risk_level: "low",
                  submitted_at: "2026-01-07T10:30:00Z"
                }
              }
            }
          }
        },
        {
          method: "GET",
          path: "/food-reports/history",
          description: "Get food report history for a specific citizen",
          parameters: [
            {
              name: "citizen_id",
              type: "query",
              required: true,
              description: "Citizen UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Report history retrieved successfully",
              example: [
                {
                  id: "response-uuid-123",
                  date: "2026-01-07",
                  time: "09:23 AM",
                  meals_per_day: 2,
                  days_of_food_left: 3,
                  food_change_type: "none",
                  shocks_experienced: [],
                  risk_level: "low",
                  food_security_score: 75
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/food-reports/stats",
          description: "Get food security statistics for a region",
          parameters: [
            {
              name: "region_id",
              type: "query",
              required: false,
              description: "Filter by specific region UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Statistics retrieved successfully",
              example: {
                totalReports: 100,
                riskDistribution: {
                  critical: 10,
                  high: 20,
                  medium: 30,
                  low: 40
                },
                averageMealsPerDay: 2.1,
                averageDaysOfFood: 4.5
              }
            }
          }
        }
      ]
    },
    {
      name: "SMS Surveys",
      icon: "📱",
      description: "SMS-based survey system for basic phones",
      endpoints: [
        {
          method: "POST",
          path: "/sms/start",
          description: "Start SMS survey for a specific citizen",
          parameters: [],
          requestBody: {
            description: "SMS survey initiation data",
            required: true,
            example: {
              citizen_id: "citizen-uuid-123",
              survey_id: "survey-uuid-456"
            }
          },
          responses: {
            200: {
              description: "SMS survey started successfully",
              example: {
                success: true,
                responseId: "response-uuid-789"
              }
            }
          }
        },
        {
          method: "POST",
          path: "/sms/receive",
          description: "Receive incoming SMS webhook from Africa's Talking",
          parameters: [],
          requestBody: {
            description: "Incoming SMS data from provider",
            required: true,
            example: {
              from: "+250788123456",
              message: "1",
              date: "2026-01-07T10:30:00Z",
              id: "msg-123456"
            }
          },
          responses: {
            200: {
              description: "SMS processed successfully",
              example: "Webhook response XML"
            }
          }
        },
        {
          method: "POST",
          path: "/sms/invite",
          description: "Send survey invitations to multiple citizens via SMS",
          parameters: [],
          requestBody: {
            description: "Bulk SMS invitation data",
            required: true,
            example: {
              survey_id: "survey-uuid-456",
              region_ids: ["region-uuid-1", "region-uuid-2"]
            }
          },
          responses: {
            200: {
              description: "Invitations sent successfully",
              example: {
                success: true,
                invitationsSent: 150,
                message: "Successfully sent 150 survey invitations via 145 successful deliveries"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/sms/stats",
          description: "Get SMS service statistics and active sessions",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "SMS statistics retrieved successfully",
              example: {
                activeSessions: 25,
                totalCitizens: 2000,
                publishedSurveys: 3
              }
            }
          }
        },
        {
          method: "POST",
          path: "/sms/create-survey",
          description: "Create standard food security survey for SMS",
          parameters: [],
          requestBody: {
            description: "Survey creation data",
            required: false,
            example: {
              title: "Weekly Food Security Check",
              description: "Monitor household food security",
              region_ids: ["region-uuid-1", "region-uuid-2"]
            }
          },
          responses: {
            200: {
              description: "Survey created successfully",
              example: {
                survey: {
                  id: "survey-uuid-456",
                  title: "Weekly Food Security Check",
                  status: "PUBLISHED"
                },
                questions: [
                  {
                    text: "How many meals did your household eat yesterday?",
                    type: "meals_per_day",
                    order_index: 1
                  }
                ],
                message: "Food security survey created successfully"
              }
            }
          }
        }
      ]
    },
    {
      name: "Users",
      icon: "👥",
      description: "User management and administration (requires authentication)",
      endpoints: [
        {
          method: "GET",
          path: "/users",
          description: "Get all users (admin only)",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Users retrieved successfully",
              example: [
                {
                  id: "user-uuid-123",
                  name: "John Doe",
                  email: "john@example.com",
                  role: "MINISTRY",
                  created_at: "2026-01-01T10:00:00Z"
                },
                {
                  id: "user-uuid-456",
                  name: "Jane Smith",
                  email: "jane@example.com",
                  role: "ADMIN",
                  created_at: "2026-01-02T11:00:00Z"
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/users/:id",
          description: "Get user by ID (admin only or own profile)",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "User UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "User retrieved successfully",
              example: {
                id: "user-uuid-123",
                name: "John Doe",
                email: "john@example.com",
                role: "MINISTRY",
                created_at: "2026-01-01T10:00:00Z"
              }
            }
          }
        },
        {
          method: "POST",
          path: "/users",
          description: "Create new user (admin only)",
          parameters: [],
          requestBody: {
            description: "New user data",
            required: true,
            example: {
              name: "New User",
              email: "newuser@example.com",
              password: "securePassword123",
              role: "FIELD_OFFICER"
            }
          },
          responses: {
            201: {
              description: "User created successfully",
              example: {
                id: "new-user-uuid",
                name: "New User",
                email: "newuser@example.com",
                role: "FIELD_OFFICER",
                created_at: "2026-01-15T14:30:00Z"
              }
            }
          }
        },
        {
          method: "PUT",
          path: "/users/:id",
          description: "Update user (admin only or own profile)",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "User UUID"
            }
          ],
          requestBody: {
            description: "Updated user data",
            required: true,
            example: {
              name: "Updated Name",
              email: "updated@example.com",
              role: "SUPERVISOR"
            }
          },
          responses: {
            200: {
              description: "User updated successfully",
              example: {
                id: "user-uuid-123",
                name: "Updated Name",
                email: "updated@example.com",
                role: "SUPERVISOR",
                created_at: "2026-01-01T10:00:00Z"
              }
            }
          }
        },
        {
          method: "DELETE",
          path: "/users/:id",
          description: "Delete user (admin only)",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "User UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "User deleted successfully",
              example: {
                message: "User deleted successfully"
              }
            }
          }
        }
      ]
    },
    {
      name: "Authentication",
      icon: "🔐",
      description: "User registration, login, and profile management",
      endpoints: [
        {
          method: "POST",
          path: "/auth/register",
          description: "Register a new user account",
          parameters: [],
          requestBody: {
            description: "User registration data",
            required: true,
            example: {
              name: "John Doe",
              email: "john@example.com",
              password: "securePassword123",
              role: "MINISTRY"
            }
          },
          responses: {
            201: {
              description: "User registered successfully",
              example: {
                message: "User registered successfully",
                user: {
                  id: "user-uuid-123",
                  name: "John Doe",
                  email: "john@example.com",
                  role: "MINISTRY"
                },
                token: "jwt-token-here"
              }
            }
          }
        },
        {
          method: "POST",
          path: "/auth/login",
          description: "Login user and receive JWT token",
          parameters: [],
          requestBody: {
            description: "User login credentials",
            required: true,
            example: {
              email: "john@example.com",
              password: "securePassword123"
            }
          },
          responses: {
            200: {
              description: "Login successful",
              example: {
                message: "Login successful",
                user: {
                  id: "user-uuid-123",
                  name: "John Doe",
                  email: "john@example.com",
                  role: "MINISTRY"
                },
                token: "jwt-token-here"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/auth/profile",
          description: "Get current user profile (authenticated)",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Profile retrieved successfully",
              example: {
                user: {
                  id: "user-uuid-123",
                  name: "John Doe",
                  email: "john@example.com",
                  role: "MINISTRY"
                }
              }
            }
          }
        },
        {
          method: "PUT",
          path: "/auth/profile",
          description: "Update current user profile (authenticated)",
          parameters: [],
          requestBody: {
            description: "Profile update data",
            required: true,
            example: {
              name: "John Smith",
              email: "johnsmith@example.com",
              role: "ADMIN"
            }
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              example: {
                message: "Profile updated successfully",
                user: {
                  id: "user-uuid-123",
                  name: "John Smith",
                  email: "johnsmith@example.com",
                  role: "ADMIN"
                }
              }
            }
          }
        }
      ]
    },
    {
      name: "Locations",
      icon: "📍",
      description: "Location management and geographic data",
      endpoints: [
        {
          method: "GET",
          path: "/locations",
          description: "Get all locations with their geographic information",
          parameters: [],
          requestBody: null,
          responses: {
            200: {
              description: "Locations retrieved successfully",
              example: [
                {
                  id: "location-uuid-123",
                  name: "Kigali City",
                  latitude: -1.9441,
                  longitude: 30.0619,
                  country: "Rwanda",
                  province: "Kigali",
                  district: "Nyarugenge",
                  sector: "Nyabugogo",
                  village: "Biryogo"
                }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/locations/:id",
          description: "Get a specific location by ID",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Location UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Location retrieved successfully",
              example: {
                id: "location-uuid-123",
                name: "Kigali City",
                latitude: -1.9441,
                longitude: 30.0619,
                country: "Rwanda",
                province: "Kigali",
                district: "Nyarugenge",
                sector: "Nyabugogo",
                village: "Biryogo"
              }
            }
          }
        },
        {
          method: "POST",
          path: "/locations",
          description: "Create a new location",
          parameters: [],
          requestBody: {
            description: "Location data",
            required: true,
            example: {
              name: "New Location",
              latitude: -1.9500,
              longitude: 30.0700,
              country: "Rwanda",
              province: "Kigali",
              district: "Nyarugenge",
              sector: "Nyabugogo",
              village: "Biryogo"
            }
          },
          responses: {
            201: {
              description: "Location created successfully",
              example: {
                id: "new-location-uuid",
                name: "New Location",
                latitude: -1.9500,
                longitude: 30.0700,
                country: "Rwanda",
                province: "Kigali",
                district: "Nyarugenge",
                sector: "Nyabugogo",
                village: "Biryogo"
              }
            }
          }
        },
        {
          method: "PUT",
          path: "/locations/:id",
          description: "Update an existing location",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Location UUID"
            }
          ],
          requestBody: {
            description: "Updated location data",
            required: true,
            example: {
              name: "Updated Location Name",
              latitude: -1.9510,
              longitude: 30.0710
            }
          },
          responses: {
            200: {
              description: "Location updated successfully",
              example: {
                id: "location-uuid-123",
                name: "Updated Location Name",
                latitude: -1.9510,
                longitude: 30.0710,
                country: "Rwanda",
                province: "Kigali",
                district: "Nyarugenge",
                sector: "Nyabugogo",
                village: "Biryogo"
              }
            }
          }
        },
        {
          method: "DELETE",
          path: "/locations/:id",
          description: "Delete a location",
          parameters: [
            {
              name: "id",
              type: "path",
              required: true,
              description: "Location UUID"
            }
          ],
          requestBody: null,
          responses: {
            200: {
              description: "Location deleted successfully",
              example: {
                message: "Location deleted successfully"
              }
            }
          }
        }
      ]
    }
  ]
};

// GET /api-docs - Main API documentation page
router.get('/', (req, res) => {
  const html = generateApiDocsHTML(apiDocumentation);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Generate HTML for API documentation
function generateApiDocsHTML(docs) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.title} v${docs.version}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .api-info {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            border-left: 4px solid #667eea;
        }
        
        .search-box {
            width: 100%;
            padding: 1rem;
            border: 2px solid #667eea;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 2rem;
            background: white;
        }
        
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .category {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s;
        }
        
        .category:hover {
            transform: translateY(-4px);
        }
        
        .category-header {
            background: #667eea;
            color: white;
            padding: 1.5rem;
            font-size: 1.3rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .category-content {
            padding: 1.5rem;
        }
        
        .endpoint {
            border-left: 4px solid #28a745;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
            transition: all 0.2s;
        }
        
        .endpoint:hover {
            background: #e9ecef;
            transform: translateX(4px);
        }
        
        .endpoint.get { border-left-color: #28a745; }
        .endpoint.post { border-left-color: #007bff; }
        .endpoint.put { border-left-color: #ffc107; }
        .endpoint.delete { border-left-color: #dc3545; }
        
        .method {
            display: inline-block;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.8rem;
            margin-right: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        .method.put { background: #ffc107; color: #212529; }
        .method.delete { background: #dc3545; color: white; }
        
        .endpoint h4 {
            display: inline;
            font-size: 1.1rem;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            transition: color 0.2s;
        }
        
        .endpoint h4:hover {
            color: #667eea;
        }
        
        .endpoint p {
            margin: 0.8rem 0 0 0;
            color: #666;
            font-size: 0.95rem;
        }
        
        .params, .request-body, .response-example {
            background: #f1f3f4;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            overflow-x: auto;
        }
        
        .param-item, .body-item, .response-item {
            margin-bottom: 1rem;
        }
        
        .param-name, .body-name, .response-name {
            color: #667eea;
            font-weight: 600;
            margin-bottom: 0.3rem;
        }
        
        .param-desc, .body-desc, .response-desc {
            color: #666;
            font-size: 0.9rem;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem;
            color: #666;
            font-size: 1.2rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #667eea;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        .code-block {
            background: #1e1e1e;
            color: #f8f8f2;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        
        .toggle-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            margin-left: 0.5rem;
            transition: background 0.2s;
        }
        
        .toggle-btn:hover {
            background: #5a67d8;
        }
        
        .collapsed {
            display: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${docs.icon || '🛡️'} ${docs.title}</h1>
        <p>${docs.description}</p>
    </div>

    <div class="container">
        <div class="api-info">
            <h3>📡 Base Information</h3>
            <p><strong>Base URL:</strong> http://localhost:3000${docs.baseUrl}</p>
            <p><strong>Version:</strong> ${docs.version}</p>
            <p><strong>Authentication:</strong> Bearer Token (JWT) - Include in Authorization header</p>
            <p><strong>Content-Type:</strong> application/json</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${docs.categories.reduce((sum, cat) => sum + cat.endpoints.length, 0)}</div>
                <div class="stat-label">Total Endpoints</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${docs.categories.length}</div>
                <div class="stat-label">API Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">100%</div>
                <div class="stat-label">Documented</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">REST</div>
                <div class="stat-label">API Style</div>
            </div>
        </div>

        <input type="text" class="search-box" placeholder="🔍 Search endpoints, methods, or descriptions..." id="searchInput" onkeyup="filterEndpoints()">

        <div class="category-grid" id="categoryGrid">
            ${docs.categories.map(category => generateCategoryHTML(category)).join('')}
        </div>

        <div class="no-results" id="noResults" style="display: none;">
            <h3>🔍 No endpoints found</h3>
            <p>Try adjusting your search terms</p>
        </div>
    </div>

    <script>
        function filterEndpoints() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const categories = document.querySelectorAll('.category');
            const noResults = document.getElementById('noResults');
            let hasResults = false;

            categories.forEach(category => {
                let categoryHasResults = false;
                const endpoints = category.querySelectorAll('.endpoint');
                
                endpoints.forEach(endpoint => {
                    const text = endpoint.textContent.toLowerCase() + 
                                 endpoint.getAttribute('data-search') || '';
                    if (text.includes(searchTerm) || searchTerm === '') {
                        endpoint.style.display = 'block';
                        categoryHasResults = true;
                        hasResults = true;
                    } else {
                        endpoint.style.display = 'none';
                    }
                });
                
                category.style.display = categoryHasResults ? 'block' : 'none';
            });

            noResults.style.display = hasResults ? 'none' : 'block';
        }

        function toggleSection(sectionId) {
            const section = document.getElementById(sectionId);
            const button = document.getElementById('btn-' + sectionId);
            
            if (section.classList.contains('collapsed')) {
                section.classList.remove('collapsed');
                button.textContent = '▼';
            } else {
                section.classList.add('collapsed');
                button.textContent = '▶';
            }
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalTitle = document.title;
                document.title = '✓ Copied!';
                setTimeout(() => {
                    document.title = originalTitle;
                }, 1000);
            });
        }

        // Add keyboard shortcut for search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });

        // Add click-to-copy for endpoints
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.endpoint h4').forEach(endpoint => {
                endpoint.style.cursor = 'pointer';
                endpoint.title = 'Click to copy endpoint path';
                endpoint.addEventListener('click', () => {
                    const path = endpoint.textContent.trim();
                    copyToClipboard(path);
                });
            });
        });
    </script>
</body>
</html>`;
}

// Generate HTML for each category
function generateCategoryHTML(category) {
  return `
    <div class="category" data-search="${category.name.toLowerCase()} ${category.description.toLowerCase()}">
        <div class="category-header">
            <span>${category.icon}</span>
            <span>${category.name}</span>
        </div>
        <div class="category-content">
            ${category.endpoints.map((endpoint, index) => generateEndpointHTML(endpoint, `${category.name.toLowerCase()}-${index}`)).join('')}
        </div>
    </div>
  `;
}

// Generate HTML for each endpoint
function generateEndpointHTML(endpoint, uniqueId) {
  const hasParams = endpoint.parameters && endpoint.parameters.length > 0;
  const hasBody = endpoint.requestBody;
  const hasResponse = endpoint.responses && endpoint.responses[200];

  return `
    <div class="endpoint ${endpoint.method.toLowerCase()}" data-search="${endpoint.path} ${endpoint.description.toLowerCase()}">
        <div>
            <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <h4 onclick="copyToClipboard('${endpoint.path}')">${endpoint.path}</h4>
            <button class="toggle-btn" id="btn-${uniqueId}" onclick="toggleSection('${uniqueId}')">▼</button>
        </div>
        <p>${endpoint.description}</p>
        
        ${hasParams ? `
            <div class="params" id="${uniqueId}-params">
                <div class="param-item">
                    <div class="param-name">Parameters:</div>
                    <div class="param-desc">
                        ${endpoint.parameters.map(param => `
                            <strong>${param.name}</strong> (${param.type}) ${param.required ? '<span style="color: #dc3545;">required</span>' : '<span style="color: #28a745;">optional</span>'}
                            ${param.enum ? `<br><em>Possible values: ${param.enum.join(', ')}</em>` : ''}
                            ${param.default ? `<br><em>Default: ${param.default}</em>` : ''}
                            <br>${param.description}
                        `).join('<br><br>')}
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${hasBody ? `
            <div class="request-body" id="${uniqueId}-body">
                <div class="body-item">
                    <div class="body-name">Request Body:</div>
                    <div class="body-desc">
                        <em>${endpoint.requestBody.description}</em>
                        ${endpoint.requestBody.required ? '<span style="color: #dc3545;"> (required)</span>' : '<span style="color: #28a745;"> (optional)</span>'}
                        <div class="code-block">${JSON.stringify(endpoint.requestBody.example, null, 2)}</div>
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${hasResponse ? `
            <div class="response-example" id="${uniqueId}-response">
                <div class="response-item">
                    <div class="response-name">Response Example (${endpoint.responses[200].description}):</div>
                    <div class="response-desc">
                        <div class="code-block">${JSON.stringify(endpoint.responses[200].example, null, 2)}</div>
                    </div>
                </div>
            </div>
        ` : ''}
    </div>
  `;
}

module.exports = router;
