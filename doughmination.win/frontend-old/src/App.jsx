import React, { useEffect, useState, useCallback } from "react";
import { Link, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import useTheme from './useTheme';
import useWebSocket from './hooks/useWebSocket';
import MemberDetails from './MemberDetails.jsx';
import Login from './Login.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Welcome from './Welcome.jsx';
import Metrics from './Metrics.jsx';
import UserProfile from './UserProfile.jsx';
import UserEdit from './UserEdit.jsx';
import useKonamiCode from './hooks/useKonamiCode';
import useSpecialDates from './hooks/useSpecialDates';
import { createDoughnutRain } from './effects/doughnutRain';
// Import components
import AdvertBanner from './AdvertBanner.jsx';
import PrivacyPolicyPage from './PrivacyPolicyPage.jsx';
import CookiesPolicyPage from './CookiesPolicyPage.jsx';
import CookieSettings from './CookieSettings.jsx';
// Import new sub-system components
import SubSystemFilter from './SubSystemFilter.jsx';
import MemberTagDisplay from './MemberTagDisplay.jsx';

function App() {
  /* ============================================================================
   * STATE MANAGEMENT
   * Application-wide state variables
   * ============================================================================
   */
  const [members, setMembers] = useState([]); // All system members
  const [filteredMembers, setFilteredMembers] = useState([]); // Filtered members for search and sub-system
  const [searchQuery, setSearchQuery] = useState(""); // Search query for members
  const [currentSubSystemFilter, setCurrentSubSystemFilter] = useState(null); // Current sub-system filter
  const [fronting, setFronting] = useState({ members: [] }); // Currently fronting members
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token")); // Authentication state
  const [isAdmin, setIsAdmin] = useState(false); // Admin privileges state
  const [loading, setLoading] = useState(true); // Initial data loading state
  const [menuOpen, setMenuOpen] = useState(false); // Menu toggle state for all devices
  const [mentalState, setMentalState] = useState(null); // Current mental state
  const [cookieConsentShown, setCookieConsentShown] = useState(false); // Track cookie consent
  const navigate = useNavigate(); // React Router navigation hook

  // Default avatar for members without one
  const defaultAvatar = "https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png";

  // Initialize theme (dark mode only)
  useTheme();

  const handleKonamiCode = useCallback(() => {
    console.log("Konami code detected! Activating doughnut rain...");
    createDoughnutRain();
  }, []);

  const handleFrontingChanged = (memberId) => {
    // Fetch updated fronting data
    fetch("/api/fronters")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch updated fronter data");
        }
        return response.json();
      })
      .then(data => {
        setFronting(data || { members: [] });
      })
      .catch(error => {
        console.error("Error fetching updated fronter:", error);
      });
    };

  useKonamiCode(handleKonamiCode);

  // Track if there's an active special date
  const { hasActiveSpecialDate } = useSpecialDates();

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(async (message) => {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'fronting_update':
        // Update fronting data
        console.log('Updating fronting with:', message.data);
        setFronting(message.data || { members: [] });
        break;
        
      case 'mental_state_update':
        // Update mental state
        console.log('Updating mental state with:', message.data);
        if (message.data) {
          setMentalState({
            ...message.data,
            updated_at: message.data.updated_at
          });
        }
        break;
        
      case 'members_update':
        // Update members list
        console.log('Updating members with:', message.data);
        if (message.data?.members) {
          const sortedMembers = [...message.data.members].sort((a, b) => {
            const nameA = (a.display_name || a.name).toLowerCase();
            const nameB = (b.display_name || b.name).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMembers(sortedMembers);
          // Re-apply current filters
          applyFilters(sortedMembers, searchQuery, currentSubSystemFilter);
        }
        break;
        
      case 'force_refresh':
        // Force refresh the entire page
        console.log('Force refresh requested');
        window.location.reload();
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [searchQuery, currentSubSystemFilter]);

  // WebSocket error handler
  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
    // You could add user notification here if desired
  }, []);

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket(handleWebSocketMessage, handleWebSocketError);
  
  // Auto-hide connection status after 3 seconds when connected
  const [showConnectionStatus, setShowConnectionStatus] = useState(true);
  
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setShowConnectionStatus(false);
      }, 3000); // Hide after 3 seconds when connected
      
      return () => clearTimeout(timer);
    } else {
      setShowConnectionStatus(true); // Always show when disconnected
    }
  }, [isConnected]);

  // Check for cookie consent banner from AdvertBanner
  useEffect(() => {
    // Check if cookies are accepted or declined
    const cookieConsent = localStorage.getItem('cookieConsent');
    setCookieConsentShown(!!cookieConsent);
  }, []);

  /* ============================================================================
   * DATA FETCHING AND INITIALIZATION
   * Initial data loading from API and user authentication check
   * ============================================================================
   */
  useEffect(() => {
    // Function to fetch public data (members and fronters)
    const fetchPublicData = async () => {
      try {
        // Fetch members data (with tags included)
        const membersRes = await fetch("/api/members");
        if (membersRes.ok) {
          const data = await membersRes.json();
          console.log("Members data from backend:", data);
          // Sort members alphabetically by name
          const sortedMembers = [...data].sort((a, b) => {
            // Use display_name if available, otherwise use name
            const nameA = (a.display_name || a.name).toLowerCase();
            const nameB = (b.display_name || b.name).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMembers(sortedMembers);
          setFilteredMembers(sortedMembers);
        } else {
          console.error("Error fetching members:", membersRes.status);
        }

        // Fetch current fronting member (if available)
        const frontingRes = await fetch("/api/fronters");
        if (frontingRes.ok) {
          const data = await frontingRes.json();
          console.log("Fronting member data:", data);
          setFronting(data || { members: [] });
        } else {
          console.error("Error fetching fronters:", frontingRes.status);
        }

        // Fetch system info (including mental state)
        const systemRes = await fetch("/api/system");
        if (systemRes.ok) {
          const data = await systemRes.json();
          console.log("System data:", data);
          if (data.mental_state) {
            setMentalState(data.mental_state);
          }
        } else {
          console.error("Error fetching system info:", systemRes.status);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Function to check admin status when logged in
    const checkAdminStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return false;
      }

      try {
        const res = await fetch("/api/is_admin", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setIsAdmin(!!data.isAdmin);
          setLoggedIn(true);
          return true;
        } else {
          // Token invalid or expired
          localStorage.removeItem("token");
          setLoggedIn(false);
          setIsAdmin(false); 
          return false;
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        localStorage.removeItem("token");
        setLoggedIn(false);
        setIsAdmin(false);
        return false;
      }
    };

    // Main initialization function
    const initialize = async () => {
      // First check auth status if there's a token
      if (localStorage.getItem("token")) {
        await checkAdminStatus();
      }
      
      // Then fetch public data regardless of auth status
      await fetchPublicData();
    };

    initialize();
  }, []);

  /* ============================================================================
   * FILTERING FUNCTIONALITY
   * Apply search and sub-system filters to members
   * ============================================================================
   */
  const applyFilters = useCallback((membersList, search, subsystemFilter) => {
    let filtered = [...membersList];

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      filtered = filtered.filter(member => {
        const name = member.name.toLowerCase();
        const displayName = (member.display_name || "").toLowerCase();
        const pronouns = (member.pronouns || "").toLowerCase();
        return name.includes(query) || 
               displayName.includes(query) || 
               pronouns.includes(query);
      });
    }

    // Apply sub-system filter
    if (subsystemFilter) {
      filtered = filtered.filter(member => {
        const tags = member.tags || [];
        
        if (subsystemFilter === 'untagged') {
          return tags.length === 0;
        }
        
        return tags.includes(subsystemFilter);
      });
    }

    setFilteredMembers(filtered);
  }, []);

  // Apply filters when search query or sub-system filter changes
  useEffect(() => {
    applyFilters(members, searchQuery, currentSubSystemFilter);
  }, [members, searchQuery, currentSubSystemFilter, applyFilters]);

  /* ============================================================================
   * EVENT HANDLERS
   * ============================================================================
   */
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle sub-system filter change
  const handleSubSystemFilterChange = (filter) => {
    setCurrentSubSystemFilter(filter);
  };

  /**
   * Creates a combined avatar display for cofronts
   */
  const getCofrontAvatar = (member) => {
    if (!member.is_cofront || !member.component_avatars || member.component_avatars.length === 0) {
      return member.avatar_url || defaultAvatar;
    }
    
    // For now, just use the first component avatar
    // In the future, you could create a combined image or cycle through them
    return member.component_avatars[0] || defaultAvatar;
  };

  /**
   * Expands cofront members into their individual component members for display
   * This allows showing multiple avatars when a cofront is fronting
   */
  const expandFrontingMembers = (frontingMembers) => {
    if (!frontingMembers || !Array.isArray(frontingMembers)) {
      return [];
    }

    const expandedMembers = [];

    frontingMembers.forEach(member => {
      if (member.is_cofront && member.component_members && member.component_members.length > 0) {
        // This is a cofront - expand it into individual component members
        member.component_members.forEach(componentMember => {
          expandedMembers.push({
            ...componentMember,
            // Mark that this member is part of a cofront for display purposes
            _isFromCofront: true,
            _cofrontName: member.name,
            _cofrontDisplayName: member.display_name || member.name
          });
        });
      } else {
        // This is a regular member or special member - add as-is
        expandedMembers.push(member);
      }
    });

    return expandedMembers;
  };

  /* ============================================================================
   * FRONTING MEMBER UPDATES
   * Updates favicon, title, and meta tags based on who's fronting
   * ============================================================================
   */
  useEffect(() => {
    if (fronting && fronting.members && fronting.members.length > 0) {
      // Expand cofronts for title generation
      const expandedMembers = expandFrontingMembers(fronting.members);
      
      if (expandedMembers.length === 1) {
        // Single member fronting - existing behavior
        const frontingMember = expandedMembers[0];
        const displayName = frontingMember.display_name || frontingMember.name || 'Unknown';
        
        // Show cofront info in title if applicable
        const titleSuffix = frontingMember._isFromCofront ? ` (part of ${frontingMember._cofrontDisplayName})` : '';
        document.title = `Currently Fronting: ${displayName}${titleSuffix}`;
        
        // Get appropriate avatar
        const frontingAvatar = frontingMember.avatar_url || defaultAvatar;
        
        // Update favicon
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = frontingAvatar;
        document.head.appendChild(link);
        
        // Update apple-touch-icon for iOS
        const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
        touchIcon.rel = 'apple-touch-icon';
        touchIcon.href = frontingAvatar;
        document.head.appendChild(touchIcon);
        
        // Update meta tags for better link sharing
        updateMetaTags(frontingMember);
      } else {
        // Multiple members fronting (including expanded cofronts)
        const memberNames = expandedMembers
          .map(member => member.display_name || member.name || 'Unknown')
          .slice(0, 3) // Limit to first 3 names to avoid very long titles
          .join(', ');
        
        const remainingCount = expandedMembers.length - 3;
        const titleSuffix = remainingCount > 0 ? ` +${remainingCount} more` : '';
        
        // Check if there are cofronts involved
        const cofrontInfo = fronting.members.some(m => m.is_cofront) ? ' (including cofronts)' : '';
        
        document.title = `Currently Fronting (${expandedMembers.length}): ${memberNames}${titleSuffix}${cofrontInfo}`;
        
        // Use the first member's avatar for favicon
        const firstMember = expandedMembers[0];
        const frontingAvatar = firstMember.avatar_url || defaultAvatar;
        
        // Update favicon
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = frontingAvatar;
        document.head.appendChild(link);
        
        // Update apple-touch-icon for iOS
        const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
        touchIcon.rel = 'apple-touch-icon';
        touchIcon.href = frontingAvatar;
        document.head.appendChild(touchIcon);
        
        // Update meta tags for multiple members
        updateMetaTags(firstMember, expandedMembers.length);
      }
    } else {
      document.title = "Doughmination System® Server";
      
      // Reset favicon
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = defaultAvatar;
      document.head.appendChild(link);
      
      // Reset apple-touch-icon
      const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      touchIcon.href = defaultAvatar;
      document.head.appendChild(touchIcon);
      
      // Reset meta tags
      updateMetaTags();
    }
  }, [fronting, defaultAvatar]);

  /* ============================================================================
   * MENU HANDLING
   * Close menu when navigating to a new page and handle body scrolling
   * ============================================================================
   */
  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false);
      document.body.style.overflow = '';
    }
  }, [navigate]);
  
  // Cleanup function to ensure body scroll is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  /* ============================================================================
   * HELPER FUNCTIONS
   * Utility functions for various tasks
   * ============================================================================
   */
  
  // Toggle menu function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    
    // Control body scrolling when menu is open/closed
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Function to update meta tags for better link sharing
  const updateMetaTags = (frontingMember = null, memberCount = 1) => {
    // Update Open Graph title
    let metaTitle = document.querySelector('meta[property="og:title"]');
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaTitle);
    }
    
    // Update Open Graph image
    let metaImage = document.querySelector('meta[property="og:image"]');
    if (!metaImage) {
      metaImage = document.createElement('meta');
      metaImage.setAttribute('property', 'og:image');
      document.head.appendChild(metaImage);
    }
    
    // Update description
    let metaDesc = document.querySelector('meta[property="og:description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('property', 'og:description');
      document.head.appendChild(metaDesc);
    }
    
    if (frontingMember) {
      // Custom meta data for current fronter(s)
      const displayName = frontingMember.display_name || frontingMember.name;
      const avatarUrl = frontingMember.avatar_url || defaultAvatar;
      
      if (memberCount === 1) {
        const titleSuffix = frontingMember._isFromCofront ? ` (part of ${frontingMember._cofrontDisplayName})` : '';
        metaTitle.setAttribute('content', `Currently Fronting: ${displayName}${titleSuffix}`);
        metaDesc.setAttribute('content', `Learn more about ${displayName} and other system members`);
      } else {
        metaTitle.setAttribute('content', `Currently Co-Fronting (${memberCount}): ${displayName} and others`);
        metaDesc.setAttribute('content', `${memberCount} system members are currently fronting together`);
      }
      
      metaImage.setAttribute('content', avatarUrl);
    } else {
      // Default meta data
      metaTitle.setAttribute('content', 'Doughmination System®');
      metaImage.setAttribute('content', defaultAvatar);
      metaDesc.setAttribute('content', 'View current fronters and members of the Doughmination System®.');
    }
    
    // Also update Twitter card tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', metaTitle.getAttribute('content'));
    if (twitterImage) twitterImage.setAttribute('content', metaImage.getAttribute('content'));
    if (twitterDesc) twitterDesc.setAttribute('content', metaDesc.getAttribute('content'));
  };

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  }

  /* ============================================================================
   * MENTAL STATE FUNCTIONS
   * Functions for displaying mental state information
   * ============================================================================
   */
  const getMentalStateLabel = (level) => {
    const labels = {
      'safe': 'Safe',
      'unstable': 'Unstable',
      'idealizing': 'Idealizing',
      'self-harming': 'Self-Harming',
      'highly at risk': 'Highly At Risk'
    };
    return labels[level] || level;
  };

  const getMentalStateIcon = (level) => {
    const icons = {
      'safe': '✅',
      'unstable': '⚠️',
      'idealizing': '❗',
      'self-harming': '🚨',
      'highly at risk': '⛔'
    };
    return icons[level] || '❓';
  };

  // Show loading state while initializing
  if (loading) return <div className="text-black dark:text-white p-10 text-center">Loading...</div>;

  /* ============================================================================
   * COMPONENT RENDER
   * Main application layout and routing
   * ============================================================================ */
  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto text-black dark:text-white">
      {/* WebSocket connection status indicator - Fixed positioning with auto-fade */}
      {(!isConnected || showConnectionStatus) && (
        <div className="fixed top-16 right-4 z-30 sm:top-[65px] sm:right-6 md:right-8">
          <div 
            className={`px-2 py-1 rounded text-xs transition-all duration-500 backdrop-filter backdrop-blur-sm transform
              ${isConnected 
                ? 'bg-green-500 text-white opacity-75 hover:opacity-100' 
                : 'bg-red-500 text-white opacity-100'
              } 
              ${menuOpen ? 'scale-0 translate-y-[-20px] opacity-0 pointer-events-none' : ''} 
              ${!showConnectionStatus && isConnected ? 'websocket-status-exit' : 'websocket-status-enter'}`}
          >
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </div>
        </div>
      )}
      
      {/* ========== NAVIGATION BAR WITH DESKTOP AND HAMBURGER MENU ========== */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-lg font-semibold z-10">Doughmination System®</Link>
          
          {/* Desktop Navigation - Always visible on larger screens */}
          <div className="desktop-nav hidden md:flex items-center gap-3">
            <a
              href="https://www.butterfly-network.win"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Butterfly Network
            </a>
            {loggedIn && (
              <Link 
                to="/admin/metrics"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Metrics
              </Link>
            )}
            
            {loggedIn && (
              <Link 
                to="/admin/user"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                My Profile
              </Link>
            )}
            
            {loggedIn ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard"
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Hamburger menu button - for mobile devices */}
          <button 
            className="hamburger-menu flex md:hidden items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Navigation overlay for mobile devices only */}
        {menuOpen && (
          <div className="mobile-menu-overlay fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={toggleMenu}>
            <div 
              className="absolute right-0 top-[61px] w-64 max-w-[80vw] h-screen bg-white dark:bg-gray-800 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="flex flex-col p-4 gap-3">
                <li>
                <a
                  href="https://clovetwilight3.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-blue-500 text-white rounded-lg text-sm text-center"
                  onClick={toggleMenu}
                  >
                  Clove's Homepage
                  </a>
                </li>
                
                {loggedIn && (
                  <li>
                    <Link 
                      to="/admin/metrics"
                      className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      Metrics
                    </Link>
                  </li>
                )}
                {loggedIn && (
                  <li>
                    <Link 
                      to="/admin/user"
                      className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      My Profile
                    </Link>
                  </li>
                )}
                {loggedIn ? (
                  <>
                    {isAdmin && (
                      <li>
                        <Link 
                          to="/admin/dashboard"
                          className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                          onClick={toggleMenu}
                        >
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg text-sm text-center"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link 
                      to="/admin/login"
                      className="block w-full px-4 py-3 bg-green-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                  </li>
                )}
                
                {/* Add links to Privacy Policy and Cookies Policy in mobile menu */}
                <li>
                  <Link 
                    to="/privacy-policy"
                    className="block w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm text-center"
                    onClick={toggleMenu}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cookies-policy"
                    className="block w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm text-center"
                    onClick={toggleMenu}
                  >
                    Cookies Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Space for fixed header */}
      <div className="h-16 sm:h-14"></div>
      
      {/* Special Date Container - MOVED TO TOP */}
      <div id="special-date-container" className="special-date-container w-full relative">
        {/* Special date banners will be rendered here by useSpecialDates hook */}
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="container mx-auto px-2 sm:px-4 pt-4 flex-grow">
        <div className="flex">
          {/* Sidebar Ad Banner - Only visible on desktop */}
          <AdvertBanner 
            adSlot="7362645348"
            adFormat="auto"
            position="sidebar"
            responsive={true}
          />
          
          <div className="flex-1">
            {/* Content Container - wrapping all core content with proper spacing */}
            <div className="content-wrapper flex flex-col gap-2 sm:gap-4">
              {/* Welcome banner - only shown when logged in */}
              {loggedIn && <Welcome loggedIn={loggedIn} isAdmin={isAdmin} />}
              
              {/* Main content from routes */}
              <Routes>
                {/* Home Page - Member Grid with Search */}
                <Route path="/" element={
                  <div className="mt-2">
                    <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
                      System Members: 
                    </h1> 
                    
                    {/* Mental State Banner - Moved BEFORE fronting section */}
                    {mentalState && (
                      <div className={`mental-state-banner ${mentalState.level.replace(' ', '-')}`}>
                        <div className="flex items-center justify-center gap-3">
                          <span className="mental-state-icon">
                            {getMentalStateIcon(mentalState.level)}
                          </span>
                          <div>
                            <span className="mental-state-label">Current Status: </span>
                            <span className="mental-state-level">{getMentalStateLabel(mentalState.level)}</span>
                            {mentalState.notes && (
                              <p className="mental-state-notes">{mentalState.notes}</p>
                            )}
                          </div>
                        </div>
                        <small className="mental-state-updated">
                          Last updated: {new Date(mentalState.updated_at).toLocaleString()}
                        </small>
                      </div>
                    )}
                    
                    {/* Currently Fronting Section - Updated for multiple members with cofront expansion */}
                    {fronting && fronting.members && fronting.members.length > 0 && (
                      <div className="mb-6 p-4 border-b dark:border-gray-700">
                        {(() => {
                          // Expand cofronts into individual members for display
                          const expandedMembers = expandFrontingMembers(fronting.members);
                          
                          return (
                            <>
                              <h2 className="text-lg font-semibold mb-3 text-center">
                                Currently Fronting{expandedMembers.length > 1 ? ` (${expandedMembers.length})` : ""}:
                              </h2>
                              <div className="fronting-members-container">
                                {expandedMembers.map((member, index) => (
                                  <div key={member.id || `${member.name}-${index}`} className="fronting-member">
                                    <div className="avatar-container fronting-avatar">
                                      <img
                                        src={member.avatar_url || defaultAvatar}
                                        alt={member.display_name}
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.src=defaultAvatar;
                                          }}
                                          style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            aspectRatio: '1/1',
                                            objectFit: 'cover'
                                            }}
                                      />
                                    </div>
                                    <span className="fronting-member-name">
                                      {member.display_name || member.name || "Unknown"}
                                      {/* Display member tags */}
                                      <MemberTagDisplay tags={member.tags} className="mt-1" />
                                      {/* Add Cofront label if this member is from a cofront */}
                                      {member._isFromCofront && (
                                        <span className="cofront-badge ml-2">
                                          {member._cofrontDisplayName}
                                        </span>
                                      )}
                                      {/* Add Special label for system/sleeping */}
                                      {member?.is_special && (
                                        <span className="special-badge ml-2">
                                          {member?.original_name === "system" ? "Unsure" : "Sleeping"}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Show original cofront info if there are any cofronts */}
                              {fronting.members.some(m => m.is_cofront) && (
                                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                                  {fronting.members
                                    .filter(m => m.is_cofront)
                                    .map(cofront => `${cofront.display_name || cofront.name} (${cofront.component_members?.length || 0} members)`)
                                    .join(', ')} currently co-fronting
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    <h2 className="text-lg font-semibold mb-4 text-center">Members:</h2>
                    
                    {/* Sub-system Filter */}
                    <SubSystemFilter 
                      onFilterChange={handleSubSystemFilterChange}
                      currentFilter={currentSubSystemFilter}
                    />
                    
                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto mb-6">
                      <div className="flex items-center border rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full p-3 bg-transparent outline-none text-black dark:text-white"
                        />
                        {searchQuery && (
                          <button 
                            onClick={clearSearch}
                            className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <div className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {filteredMembers.length > 0 ? (
                      <div className="grid member-grid gap-5">
                        {filteredMembers
                          .filter(member => !member.is_private && !member.is_cofront && !member.is_special) // Hide cofronts and special members
                          .map((member) => (
                            <div key={member.id} className="member-grid-item">
                              <div className="h-full w-full p-2">
                                <Link 
                                  to={`/${member.name.toLowerCase()}`} 
                                  className="block h-full border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 transform transition-all duration-300"
                                >
                                  <div className="flex flex-col items-center justify-center h-full p-3">
                                    <div className="avatar-container">
                                      <img
                                        src={getCofrontAvatar(member) || defaultAvatar}
                                        alt={member.name}
                                        loading="lazy"
                                      />
                                    </div>
                                    <span className="member-name">
                                      {member.display_name || member.name}
                                    </span>
                                    {/* Display member tags */}
                                    <MemberTagDisplay tags={member.tags} className="mt-2" />
                                  </div>
                                </Link>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : searchQuery || currentSubSystemFilter ? (
                      <div className="text-center mt-8">
                        <p>No members found matching current filters.</p>
                        {(searchQuery || currentSubSystemFilter) && (
                          <div className="mt-4 space-x-2">
                            {searchQuery && (
                              <button 
                                onClick={clearSearch}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                Clear search
                              </button>
                            )}
                            {currentSubSystemFilter && (
                              <button 
                                onClick={() => setCurrentSubSystemFilter(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                Clear filter
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center mt-8">No members found. Please check your connection.</p>
                    )}
                  </div>
                } />
                
                {/* Member Detail Page */}
                <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
                
                {/* Privacy and Cookies Policy Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
                
                {/* Authentication */}
                <Route path="/admin/login" element={<Login onLogin={() => {
                  setLoggedIn(true);
                  // After login, check if user is admin
                  fetch("/api/is_admin", {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                  })
                  .then(res => res.json())
                  .then(data => {
                    setIsAdmin(!!data.isAdmin);
                    if (data.isAdmin) {
                      navigate('/admin/dashboard');
                    } else {
                      navigate('/');
                    }
                  })
                  .catch(err => {
                    console.error("Error checking admin status after login:", err);
                    navigate('/');
                  });
                }} />} />
                
                {/* User Profile Routes (protected, but no admin required) */}
                <Route path="/admin/user" element={
                  <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/user/edit" element={
                  <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
                    <UserEdit />
                  </ProtectedRoute>
                } />
                
                {/* Admin Dashboard (protected, admin required) */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminRequired={true} isAdmin={isAdmin} isLoggedIn={loggedIn}>
                    <AdminDashboard fronting={fronting} onFrontingChanged={handleFrontingChanged} />
                  </ProtectedRoute>
                } />
                
                {/* Metrics Page (protected, but no admin required) */}
                <Route path="/admin/metrics" element={
                  <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
                    <Metrics />
                  </ProtectedRoute>
                } />
                
                {/* Catch all for invalid routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </main>
      
      {/* ========== FOOTER ========== */}
      <footer className="github-footer">
        <div className="flex flex-col items-center gap-2">
          <a href="https://github.com/CloveTwilight3/docker/tree/main/doughminationsystem.win" target="_blank" rel="noopener noreferrer" className="github-button">
            <svg className="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View Source Code on GitHub
          </a>
          
          {/* Legal Links and Cookie Settings */}
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link to="/privacy-policy" className="text-blue-500 dark:text-blue-400 hover:underline text-sm">
              Privacy Policy
            </Link>
            <Link to="/cookies-policy" className="text-blue-500 dark:text-blue-400 hover:underline text-sm">
              Cookies Policy
            </Link>
            <CookieSettings />
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            &copy; Clove Twilight 2025 | "Doughmination System" is a pending trademark in the United Kingdom under trademark number UK00004263144.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
