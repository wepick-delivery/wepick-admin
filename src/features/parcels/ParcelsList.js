import React, { useState, useEffect } from 'react';
import { FaFilter, FaBox, FaCheckCircle, FaChartBar, FaTimes, FaSpinner, FaFileAlt, FaChartLine } from 'react-icons/fa';
import ParcelViewModal from './ParcelViewModal';
import ParcelEditModal from './ParcelEditModal';
import './ParcelsList.scss';
import Loading from '../../components/common/Loading';
import { getParcelSummary, getParcelReport, getParcelDetail } from '../../services/wepickApi';

const ParcelsList = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [editingParcel, setEditingParcel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parcelSummary, setParcelSummary] = useState(null);
  const [parcelReport, setParcelReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    lockerId: '',
    dateRange: '',
    retailer: '',
    location: ''
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalParcels: 0,
    activeParcels: 0,
    deliveredParcels: 0,
    averageDeliveryTime: '0 hours',
    topPerformingLockers: []
  });

  // Mock data for parcels
  const parcels = [
    {
      id: 'P001',
      status: 'Dispatched',
      sender: 'John Doe',
      recipient: 'Jane Smith',
      lockerId: 'L123',
      createdAt: '2024-03-15',
      estimatedDelivery: '2024-03-16',
      dimensions: '30x20x15 cm',
      weight: '2.5 kg',
      retailer: 'Retail Store A',
      location: 'New York',
      trackingNumber: 'TRK123456',
      deliveryAttempts: 1,
      lastUpdate: '2024-03-15 14:30'
    },
    {
      id: 'P002',
      status: 'Delivered',
      sender: 'Mike Johnson',
      recipient: 'Sarah Wilson',
      lockerId: 'L124',
      createdAt: '2024-03-14',
      estimatedDelivery: '2024-03-15',
      dimensions: '25x15x10 cm',
      weight: '1.8 kg',
      retailer: 'Retail Store B',
      location: 'Los Angeles',
      trackingNumber: 'TRK123457',
      deliveryAttempts: 2,
      lastUpdate: '2024-03-15 10:15'
    },
    {
      id: 'P003',
      status: 'In Transit',
      sender: 'Alice Brown',
      recipient: 'Bob White',
      lockerId: 'L125',
      createdAt: '2024-03-13',
      estimatedDelivery: '2024-03-17',
      dimensions: '40x30x20 cm',
      weight: '3.2 kg',
      retailer: 'Retail Store C',
      location: 'Chicago',
      trackingNumber: 'TRK123458',
      deliveryAttempts: 1,
      lastUpdate: '2024-03-15 09:00'
    },
    {
      id: 'P004',
      status: 'Failed',
      sender: 'Chris Green',
      recipient: 'Diana Blue',
      lockerId: 'L126',
      createdAt: '2024-03-12',
      estimatedDelivery: '2024-03-13',
      dimensions: '35x25x15 cm',
      weight: '2.0 kg',
      retailer: 'Retail Store D',
      location: 'Houston',
      trackingNumber: 'TRK123459',
      deliveryAttempts: 3,
      lastUpdate: '2024-03-14 16:45'
    },
    {
      id: 'P005',
      status: 'Ready for Pickup',
      sender: 'Eve Black',
      recipient: 'Frank Red',
      lockerId: 'L127',
      createdAt: '2024-03-11',
      estimatedDelivery: '2024-03-12',
      dimensions: '28x18x12 cm',
      weight: '1.5 kg',
      retailer: 'Retail Store E',
      location: 'Phoenix',
      trackingNumber: 'TRK123460',
      deliveryAttempts: 1,
      lastUpdate: '2024-03-12 11:20'
    },
    {
      id: 'P006',
      status: 'Delivered',
      sender: 'Grace Silver',
      recipient: 'Henry Gold',
      lockerId: 'L128',
      createdAt: '2024-03-10',
      estimatedDelivery: '2024-03-11',
      dimensions: '32x22x14 cm',
      weight: '2.8 kg',
      retailer: 'Retail Store F',
      location: 'Philadelphia',
      trackingNumber: 'TRK123461',
      deliveryAttempts: 2,
      lastUpdate: '2024-03-11 13:10'
    },
    {
      id: 'P007',
      status: 'Dispatched',
      sender: 'Ivy Orange',
      recipient: 'Jack Purple',
      lockerId: 'L129',
      createdAt: '2024-03-09',
      estimatedDelivery: '2024-03-10',
      dimensions: '38x28x18 cm',
      weight: '3.0 kg',
      retailer: 'Retail Store G',
      location: 'San Antonio',
      trackingNumber: 'TRK123462',
      deliveryAttempts: 1,
      lastUpdate: '2024-03-10 08:30'
    },
    {
      id: 'P008',
      status: 'In Transit',
      sender: 'Karen Pink',
      recipient: 'Leo Brown',
      lockerId: 'L130',
      createdAt: '2024-03-08',
      estimatedDelivery: '2024-03-12',
      dimensions: '29x19x13 cm',
      weight: '1.7 kg',
      retailer: 'Retail Store H',
      location: 'San Diego',
      trackingNumber: 'TRK123463',
      deliveryAttempts: 2,
      lastUpdate: '2024-03-09 15:00'
    }
  ];

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
      lockerId: '',
      dateRange: '',
      retailer: '',
      location: ''
    });
  };

  useEffect(() => {
  const loaderTimer = setTimeout(() => {
    setIsLoading(false);
  }, 1500);

  const fetchParcelData = async () => {
    try {
      // Your existing data fetching logic
      const summaryResponse = await getParcelSummary();
      if (summaryResponse?.data) {
        setAnalytics({
          totalParcels: summaryResponse.data.totalParcels || 0,
          activeParcels: summaryResponse.data.activeParcels || 0,
          deliveredParcels: summaryResponse.data.deliveredParcels || 0,
          averageDeliveryTime: summaryResponse.data.averageDeliveryTime || '0 hours',
          topPerformingLockers: summaryResponse.data.topPerformingLockers || []
        });
      }

      await getParcelReport();
    } catch (err) {
      setError('Failed to load parcel data. Please try again later.');
    }
  };

  fetchParcelData();

  return () => {
    clearTimeout(loaderTimer);
  };
}, []);

  const handleApplyFilters = () => {
    const filteredCount = getFilteredParcels().length;
    alert(`Found ${filteredCount} parcels matching your criteria`);
  };

  const getFilteredParcels = () => {
    return parcels.filter(parcel => {
      if (filters.search && !parcel.id.toLowerCase().includes(filters.search.toLowerCase()) &&
          !parcel.trackingNumber.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.status && parcel.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      if (filters.lockerId && parcel.lockerId.toLowerCase() !== filters.lockerId.toLowerCase()) {
        return false;
      }

      if (filters.dateRange) {
        const createdDate = new Date(parcel.createdAt);
        const filterDate = new Date(filters.dateRange);
        if (createdDate < filterDate) {
          return false;
        }
      }

      if (filters.retailer && !parcel.retailer.toLowerCase().includes(filters.retailer.toLowerCase())) {
        return false;
      }

      if (filters.location && !parcel.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Dispatched': '#4CAF50',
      'In Transit': '#2196F3',
      'Delivered': '#4CAF50',
      'Failed': '#F44336',
      'Ready for Pickup': '#FF9800'
    };
    return colors[status] || '#666';
  };

  const handleViewParcel = async (parcel) => {
    try {
      setIsLoading(true);
      const response = await getParcelDetail(parcel.id);
      if (response?.data) {
        setSelectedParcel(response.data);
      }
    } catch (err) {
      setError('Failed to load parcel details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditParcel = (parcel) => {
    setEditingParcel(parcel);
  };

  const handleSaveParcel = (updatedParcel) => {
    // Here you would typically make an API call to update the parcel
    console.log('Saving parcel:', updatedParcel);
    // After successful update, you would update the parcels list
    setEditingParcel(null);
  };

  return (
    <div className="parcels-list-container">
      {/* Analytics Dashboard */}
      <div className="analytics-dashboard">
        <div className="analytics-card">
          <FaBox />
          <div className="analytics-info">
            <h3>Total Parcels</h3>
            <p>{isLoading ? "..." : analytics.totalParcels}</p>
          </div>
        </div>
        <div className="analytics-card">
          <FaCheckCircle />
          <div className="analytics-info">
            <h3>Active Parcels</h3>
            <p>{isLoading ? "..." : analytics.activeParcels}</p>
          </div>
        </div>
        <div className="analytics-card">
          <FaChartBar />
          <div className="analytics-info">
            <h3>Delivered Parcels</h3>
            <p>{isLoading ? "..." : analytics.deliveredParcels}</p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <h1>Parcels Management</h1>
        <div className="header-actions">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            {showFilters ? 'Close Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
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
                placeholder="Search by ID or tracking number"
              />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="dispatched">Dispatched</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="ready for pickup">Ready for Pickup</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Locker ID</label>
              <input
                type="text"
                name="lockerId"
                value={filters.lockerId}
                onChange={handleFilterChange}
                placeholder="Enter Locker ID"
              />
            </div>
            <div className="filter-group">
              <label>Date Range</label>
              <input
                type="date"
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Retailer</label>
              <input
                type="text"
                name="retailer"
                value={filters.retailer}
                onChange={handleFilterChange}
                placeholder="Enter Retailer Name"
              />
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Enter Location"
              />
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

      {/* Table View */}
      <div className="view-content">
        <div className="table-container">
          {isLoading ? (
            <>
             <Loading /> 
            </>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="parcels-table">
              <thead>
                <tr>
                  <th>Parcel ID</th>
                  <th>Status</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Locker ID</th>
                  <th>Location</th>
                  <th>Tracking Number</th>
                  <th>Created Date</th>
                  <th>Estimated Delivery</th>
                  <th>Dimensions</th>
                  <th>Weight</th>
                  <th>Retailer</th>
                  <th>Delivery Attempts</th>
                  <th>Last Update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredParcels().map((parcel) => (
                  <tr key={parcel.id}>
                    <td className="parcel-cell">
                      <div className="icon-text">
                        <FaBox className="parcel-icon" style={{ color: '#4CAF50' }} />
                        <span>{parcel.id}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(parcel.status) }}
                      >
                        {parcel.status}
                      </span>
                    </td>
                    <td>{parcel.sender}</td>
                    <td>{parcel.recipient}</td>
                    <td>{parcel.lockerId}</td>
                    <td>{parcel.location}</td>
                    <td>{parcel.trackingNumber}</td>
                    <td>{parcel.createdAt}</td>
                    <td>{parcel.estimatedDelivery}</td>
                    <td>{parcel.dimensions}</td>
                    <td>{parcel.weight}</td>
                    <td>{parcel.retailer}</td>
                    <td>{parcel.deliveryAttempts}</td>
                    <td>{parcel.lastUpdate}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view"
                          onClick={() => handleViewParcel(parcel)}
                        >
                          View
                        </button>
                        <button 
                          className="action-button edit" 
                          onClick={() => handleEditParcel(parcel)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Parcel View Modal */}
      {selectedParcel && (
        <ParcelViewModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
        />
      )}

      {editingParcel && (
        <ParcelEditModal
          parcel={editingParcel}
          onClose={() => setEditingParcel(null)}
          onSave={handleSaveParcel}
        />
      )}
    </div>
  );
};

export default ParcelsList; 