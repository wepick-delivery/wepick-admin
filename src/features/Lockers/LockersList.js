import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaLock, FaUnlock, FaFilter, FaBox, FaClock, FaExclamationTriangle, FaRedo, FaSpinner } from 'react-icons/fa';
import './LockersList.scss';
import Loading from '../../components/common/Loading';

const LockersList = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    capacity: '',
  });

  const [lockers, setLockers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalLockers: 0,
    availableLockers: 0,
    occupiedLockers: 0
  });

  const fetchLockers = async () => {
  try {
    setIsLoading(true);
    setError(null);

     setLockers([]);  
      setAnalytics({
        totalLockers: 0,
        availableLockers: 0,
        occupiedLockers: 0
      });
  } catch (err) {
    console.error('Error fetching lockers:', err);
    setError('Failed to load lockers. Please try again.');
    setLockers([]);
  } finally {
    setIsLoading(false);
  }
};

  // useEffect(() => {
  //   fetchLockers();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      location: '',
      capacity: '',
    });
  };

  const handleApplyFilters = () => {
    const filteredCount = getFilteredLockers().length;
    alert(`Found ${filteredCount} lockers matching your criteria`);
  };

  const getFilteredLockers = () => {
    return lockers.filter(locker => {
      if (filters.search && !locker.id.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.status && locker.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      if (filters.location && !locker.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      if (filters.capacity && locker.size !== filters.capacity) {
        return false;
      }

      return true;
    });
  };

  const handleUnlockLocker = async (lockerId) => {
    try {
      setIsUnlocking(prev => ({ ...prev, [lockerId]: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLockers(prev => prev.map(locker => 
        locker.id === lockerId 
          ? { ...locker, status: 'Available' }
          : locker
      ));
    } catch (error) {
      console.error('Error unlocking locker:', error);
      setError(`Failed to unlock locker ${lockerId}. Please try again.`);
    } finally {
      setIsUnlocking(prev => ({ ...prev, [lockerId]: false }));
    }
  };

  

  const getStatusColor = (status) => {
    return status === 'Available' ? '#4CAF50' : '#F44336';
  };

  return (
    <div className="lockers-list-container">
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="analytics-icon total">
            <FaBox />
          </div>
          <div className="analytics-info">
            <h3>Total Lockers</h3>
            <p>{isLoading ? '...' : analytics.totalLockers}</p>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon available">
            <FaLock />
          </div>
          <div className="analytics-info">
            <h3>Available Lockers</h3>
            <p>{isLoading ? '...' : analytics.availableLockers}</p>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon occupied">
            <FaUnlock />
          </div>
          <div className="analytics-info">
            <h3>Occupied Lockers</h3>
            <p>{isLoading ? '...' : analytics.occupiedLockers}</p>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div className="header-content">
          <h1>Lockers Management</h1>
          <p className="subtitle">Monitor and manage your smart lockers</p>
        </div>
        <div className="header-actions">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />{showFilters ? 'Close Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`filters-section ${showFilters ? 'show' : 'hide'}`}>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search Lockers..."
              />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Enter location..."
              />
            </div>
            <div className="filter-group">
              <label>Capacity</label>
              <select name="capacity" value={filters.capacity} onChange={handleFilterChange}>
                <option value="">All Capacities</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <button className="reset-button" onClick={handleResetFilters}>
              Reset Filters
            </button>
            <button className="apply-button" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : error || lockers.length === 0 ? (
        <div className="no-data-container">
          <div className="no-data-content">
            {/* <FaExclamationTriangle className="error-icon" /> */}
            <p className="error-message">{error || 'No lockers available'}</p>
            <button className="retry-button" onClick={fetchLockers}>
              {/* <FaRedo /> */}
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="lockers-table-container">
          <table className="lockers-table">
            <thead>
              <tr>
                <th>Locker ID</th>
                <th>Location</th>
                <th>Status</th>
                <th>Size</th>
                <th>Last Used</th>
                <th>Bus Number</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredLockers().map((locker) => (
                <tr key={locker.id}>
                  <td>
                    <div className="locker-id">
                      <span>{locker.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      <FaMapMarkerAlt className="icon" />
                      <span>{locker.location}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(locker.status) }}
                    >
                      {locker.status}
                    </span>
                  </td>
                  <td>
                    <span className="size-badge">{locker.size}</span>
                  </td>
                  <td>
                    <div className="time-cell">
                      <FaClock className="icon" />
                      <span>{new Date(locker.lastUsed).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="bus-number">
                      <span className="bus-badge">{locker.busNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="capacity-cell">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: locker.capacity,
                            backgroundColor: locker.capacity > '80%' ? '#4CAF50' : '#FFC107'
                          }}
                        />
                      </div>
                      <span className="capacity-text">{locker.capacity}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className={`unlock-button ${isUnlocking[locker.id] ? 'loading' : ''}`}
                      onClick={() => handleUnlockLocker(locker.id)}
                      disabled={locker.status === 'Available' || isUnlocking[locker.id]}
                    >
                      {isUnlocking[locker.id] ? (
                        <div className="button-spinner"></div>
                      ) : (
                        <>
                          {locker.status === 'Available' ? <FaLock /> : <FaUnlock />}
                          {locker.status === 'Available' ? 'Locked' : 'Unlock'}
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LockersList;