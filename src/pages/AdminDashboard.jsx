
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:8080/api/orders';

const STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

function formatStatus(status = 'PLACED') {
  return status.replaceAll('_', ' ');
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

function getItems(order) {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return [];
  }

  return order.items.map((item) => ({
    name: item.foodName || item.food?.name || item.name || 'Food item',
    quantity: Number(item.quantity || 1),
    price: Number(item.price ?? item.unitPrice ?? item.food?.price ?? 0),
  }));
}

export default function AdminDashboard({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      setError('');

   const response = await fetch(`${API_URL}/admin`, {
  method: 'GET',
  credentials: 'include',
});
      if (!response.ok) {
        throw new Error(`Unable to fetch orders (HTTP ${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('The orders API did not return an array.');
      }

      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function updateStatus(orderId, status) {
    const previousOrders = orders;

    setUpdatingId(orderId);
    setError('');
    setNotice('');

    // Update the visible status immediately.
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );

    try {
     const response = await fetch(`${API_URL}/${orderId}/status`, {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ status }),
});
      if (!response.ok) {
        throw new Error(`Status update failed (HTTP ${response.status}).`);
      }

      setNotice(`Order #${orderId} is now ${formatStatus(status)}.`);
      await fetchOrders(false);
    } catch (err) {
      setOrders(previousOrders);
      setError(err.message || 'Could not update the order status.');
    } finally {
      setUpdatingId(null);
    }
  }

  const totalRevenue = orders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const activeOrders = orders.filter(
    (order) => !['DELIVERED', 'CANCELLED'].includes(order.status || 'PLACED')
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === 'DELIVERED'
  ).length;

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' || (order.status || 'PLACED') === statusFilter;

      const itemsText = getItems(order).map((item) => item.name).join(' ');

      const searchableText = [
        order.id,
        order.customerName,
        order.phone,
        order.address,
        order.status,
        itemsText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [orders, search, statusFilter]);

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">CRAVEVERSE MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage customer orders and keep deliveries moving.</p>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            onClick={() => fetchOrders()}
            disabled={loading}
          >
            ↻ {loading ? 'Loading...' : 'Refresh'}
          </button>

          <button type="button" onClick={onBack}>
            ← Back to Menu
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {notice && (
        <p className="admin-notice" role="status">
          ✓ {notice}
        </p>
      )}

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
          <small>All customer orders</small>
        </article>

        <article className="admin-stat">
          <span>Active Orders</span>
          <strong>{activeOrders}</strong>
          <small>Still in progress</small>
        </article>

        <article className="admin-stat">
          <span>Delivered</span>
          <strong>{deliveredOrders}</strong>
          <small>Successfully delivered</small>
        </article>

        <article className="admin-stat">
          <span>Order Value*</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
          <small>Excludes cancelled orders</small>
        </article>
      </section>

      <section className="admin-orders">
        <div className="admin-section-heading">
          <div>
            <h2>Customer Orders</h2>
            <p>Search orders, review delivery details, and update status.</p>
          </div>

          <span>{filteredOrders.length} of {orders.length} orders</span>
        </div>

        <div className="admin-filters">
          <label className="admin-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, order ID, address..."
              aria-label="Search customer orders"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <label className="admin-status-filter">
            <span>Filter status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="admin-empty">Loading customer orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <h3>No matching orders</h3>
            <p>Try a different search or select another status.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const status = order.status || 'PLACED';
                  const items = getItems(order);
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>

                        <td>
                          <strong>{order.customerName || 'Customer'}</strong>
                          <small>{order.phone || 'No phone provided'}</small>
                        </td>

                        <td>
                          {items.length ? (
                            <div className="admin-item-summary">
                              {items.map((item, index) => (
                                <div key={`${order.id}-${index}`}>
                                  {item.name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          ) : (
                            'Item details unavailable'
                          )}
                        </td>

                        <td>
                          <strong>{formatCurrency(order.totalAmount)}</strong>
                        </td>

                        <td>
                          <span
                            className={`admin-status status-${status.toLowerCase()}`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>

                        <td>
                          <select
                            className="admin-status-select"
                            value={status}
                            onChange={(event) =>
                              updateStatus(order.id, event.target.value)
                            }
                            disabled={updatingId === order.id}
                            aria-label={`Update status for order ${order.id}`}
                          >
                            {STATUSES.map((option) => (
                              <option key={option} value={option}>
                                {formatStatus(option)}
                              </option>
                            ))}
                          </select>

                          {updatingId === order.id && (
                            <small className="admin-updating">Saving...</small>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-details-button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedOrder(isExpanded ? null : order.id)
                            }
                          >
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="admin-detail-row">
                          <td colSpan={7}>
                            <div className="admin-order-details">
                              <div>
                                <span>Order number</span>
                                <strong>#{order.id}</strong>
                              </div>

                              <div>
                                <span>Customer</span>
                                <strong>{order.customerName || 'Not provided'}</strong>
                              </div>

                              <div>
                                <span>Phone</span>
                                <strong>{order.phone || 'Not provided'}</strong>
                              </div>

                              <div className="admin-address">
                                <span>Delivery address</span>
                                <strong>{order.address || 'Address not available from API'}</strong>
                              </div>

                              <div className="admin-detail-items">
                                <span>Order items</span>
                                {items.length ? (
                                  items.map((item, index) => (
                                    <p key={`${order.id}-detail-${index}`}>
                                      {item.name} × {item.quantity}
                                      {item.price > 0 && (
                                        <> — {formatCurrency(item.price * item.quantity)}</>
                                      )}
                                    </p>
                                  ))
                                ) : (
                                  <p>Item details were not returned by the API.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-footnote">
          *Order value excludes cancelled orders. It is not necessarily
          the amount of revenue collected.
        </p>
      </section>
    </main>
  );
}
