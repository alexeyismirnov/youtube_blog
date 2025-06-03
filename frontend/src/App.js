import React, { useState, useEffect } from 'react';
import SubscriptionList from './components/SubscriptionList';
import Drawer from './components/Drawer';
import DrawerToggle from './components/DrawerToggle';
import TimelineView from './components/TimelineView';
import './App.css';
import './styles/common.css';
import './styles/ios-pwa.css'; // Import iOS-specific styles
import { isIOS, isInStandaloneMode, applyIOSClasses, showIOSInstallPrompt, addIOSPromptStyles } from './utils/iosDetection';

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState({}); // subscriptionId: categoryId
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  // Apply iOS-specific classes and show install prompt
  useEffect(() => {
    // Apply iOS-specific classes
    if (isIOS()) {
      applyIOSClasses();
    }
    
    // Check if running as PWA
    setIsPWA(isInStandaloneMode());
    
    // Show iOS install prompt after a delay (only in browser mode)
    if (isIOS() && !isInStandaloneMode()) {
      addIOSPromptStyles();
      const timer = setTimeout(() => {
        showIOSInstallPrompt();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth > 1024;
      // On wide screens, drawer should be open by default
      // On narrow screens, drawer should be closed by default
      if (wide) {
        setIsDrawerOpen(true);
      } else {
        setIsDrawerOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  // Handle view change with auto-close on mobile
  const handleViewChange = (category) => {
    setSelectedCategory(category);
    
    // Auto-close drawer on mobile screens (width <= 1024px)
    if (window.innerWidth <= 1024) {
      setIsDrawerOpen(false);
    }
  };
  
  // Function to fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure all category IDs are strings for consistent comparison
        const categoriesWithStringIds = data.map(category => ({
          ...category,
          id: String(category._id),
          _id: String(category._id)
        }));
        setCategories(categoriesWithStringIds);
      } else {
        console.error('Failed to fetch categories. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  // Check for user in URL after OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
    try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser({
          id: userData.id, // Use consistent 'id' field from backend
          displayName: userData.displayName,
          photos: userData.photos
      });
      
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error('Error parsing user data:', error);
    } finally {
        setLoading(false);
    }
    } else {
      // Check authentication status via API if no user in URL
      const checkAuth = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/status`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.isAuthenticated) {
              setUser({
                id: userData.user.id, // Use consistent 'id' field from backend
                displayName: userData.user.displayName,
                photos: userData.user.photos
              });
            } else {
            }
          } else {
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
        } finally {
          setLoading(false);
        }
      };
      
      checkAuth();
    }
  }, []);

  // Fetch subscriptions when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);
  
  // Fetch categories and assignments when user changes
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchAssignments();
    }
  }, [user]);
  
  // Fetch subscriptions from backend
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch subscriptions. Status:', response.status, 'Response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  // Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assignments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert to mapping: { subscriptionId: categoryId }
        const assignmentMap = {};
        data.forEach(assignment => {
          // Use the categoryName provided by the backend
          assignmentMap[assignment.subscriptionId] = {
            id: assignment.categoryId,
            name: assignment.categoryName || 'Unknown'
          };
        });
        setAssignments(assignmentMap);
      } else {
        console.error('Failed to fetch assignments. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };
  
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
  };
  
  const handleLogout = async () => {
    try {
        // First, reset the local state
        setUser(null);
        setSubscriptions([]);
        
        // Then attempt to logout on the server side
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
          credentials: 'include',
          mode: 'no-cors'
        }).catch(err => {
          // Silently catch any network errors - we've already logged out locally
          console.log("Backend logout request completed");
        });
        
      } catch (error) {
        console.error('Logout failed:', error);
        // Still reload the page even if there's an error
        window.location.reload();
      }
  };
  
  const handleAssignSubscription = async (subscriptionId, categoryId) => {
    if (!categoryId) {
      // Unassign if categoryId is empty
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId, categoryId: '' })
      });
      fetchAssignments();
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId, categoryId })
      });

      // Update UI immediately for better UX
      const category = categories.find(c => c.id === categoryId || c._id === categoryId);
      setAssignments(prev => ({
        ...prev,
        [subscriptionId]: {
          id: categoryId,
          name: category?.name || 'Unknown'
        }
      }));
    } catch (error) {
      console.error('Failed to assign subscription:', error);
}
  };

  const handleCreateCategory = async (name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
      } else {
        console.error('Failed to create category. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };
  
  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id));
      } else {
        console.error('Failed to delete category. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      // Refresh assignments after category deletion
      fetchAssignments();
    }
  };

  if (loading) {
    return (
      <div className="App">
        <header className={isIOS() ? 'ios-status-bar-padding' : ''}>
          <h1>YouTube Subscription Manager</h1>
        </header>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`App ${isPWA ? 'pwa-mode' : ''}`}>
      <header className={isIOS() ? 'ios-status-bar-padding' : ''}>
        <div className="header-left">
          <DrawerToggle isOpen={isDrawerOpen} onToggle={toggleDrawer} />
          <div className="header-title">
            <h1>YouTube Subscription Manager</h1>
            <p>Organize your subscriptions into categories</p>
          </div>
        </div>
        
        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <img src={user.photos[0].value} alt="Profile" className="user-avatar" />
              <span>{user.displayName}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLogin}>
              Login with Google
            </button>
          )}
        </div>
      </header>
      
      {user ? (
        <main className="container">
          <Drawer
            isOpen={isDrawerOpen}
            onToggle={toggleDrawer}
            selectedCategory={selectedCategory}
            onViewChange={handleViewChange}
            categories={categories}
            onCreate={handleCreateCategory}
            onDelete={handleDeleteCategory}
          />
          
          <div className="content">
            {selectedCategory ? (
              <TimelineView categoryId={selectedCategory.id} />
            ) : (
              <SubscriptionList
                subscriptions={subscriptions}
                categories={categories}
                assignments={assignments}
                onAssign={handleAssignSubscription}
              />
            )}
          </div>
        </main>
      ) : (
        <div className="login-prompt">
          <p>Please login with Google to manage your YouTube subscriptions</p>
        </div>
      )}
      
      {/* iOS PWA install banner (only shown in browser mode on iOS) */}
      {isIOS() && !isPWA && (
        <div className="pwa-browser-only ios-install-hint">
          <p>For the best experience, install this app to your home screen</p>
        </div>
      )}
      
      {/* Footer with safe area padding on iOS */}
      <footer className={isIOS() ? 'ios-bottom-bar-padding' : ''}>
        <p>YouTube Subscription Manager PWA</p>
      </footer>
    </div>
  );
}

export default App;