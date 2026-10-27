
import React, { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/api/orders';

const ORDER_STAGES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_LABELS = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderHistory({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      setError('');

const response = await fetch(API_URL, {
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  }
});
      if (!response.ok) {
        throw new Error('Unable to load orders.');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError(
        'Could not load orders. Please check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  function formatDate(dateValue) {
    if (!dateValue) return 'Date unavailable';

    const date = new Date(dateValue);

    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleString('en-IN');
  }

  function formatStatus(status) {
    return STATUS_LABELS[status] || status || 'Order Placed';
  }

  function getStatusClass(status) {
    return (status || 'PLACED').toLowerCase().replaceAll('_', '-');
  }

  return (
    <main className="order-history">
      <header className="order-history-header">
        <div>
          <p className="order-history-eyebrow">CRAVEVERSE</p>
          <h1>My Orders</h1>
          <p className="order-history-subtitle">
            Your delicious moments, all in one place.
          </p>
          <p className="order-live-message">
            ● Order updates refresh automatically every 5 seconds.
          </p>
        </div>

        <div className="order-history-actions">
          <button
            type="button"
            className="order-refresh-button"
            onClick={onBack}
          >
            ← Back to Menu
          </button>

          <button
            type="button"
            className="order-refresh-button"
            onClick={() => fetchOrders(true)}
            disabled={loading}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      {loading && (
        <p className="order-message">Loading your orders...</p>
      )}

      {!loading && error && (
        <div className="order-error">
          <p>{error}</p>
          <button type="button" onClick={() => fetchOrders(true)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <section className="order-empty">
          <div className="order-empty-icon">🍽️</div>
          <h2>No orders yet</h2>
          <p>Your next favourite meal is waiting for you.</p>
        </section>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="order-list">
          <p className="order-count">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>

          {orders.map((order) => {
            const currentStatus = order.status || 'PLACED';
            const currentIndex = ORDER_STAGES.indexOf(currentStatus);
            const isCancelled = currentStatus === 'CANCELLED';

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div>
                    <p className="order-label">ORDER ID</p>
                    <h2>#{order.id}</h2>
                  </div>

                  <span
                    className={`order-status status-${getStatusClass(
                      currentStatus
                    )}`}
                  >
                    {formatStatus(currentStatus)}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="order-cancelled-message">
                    <span>✕</span>
                    <div>
                      <h3>Order Cancelled</h3>
                      <p>
                        This order has been cancelled. Please contact the
                        restaurant if you need more information.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="order-progress">
                    {ORDER_STAGES.map((status, index) => {
                      const completed = currentIndex >= 0 && index <= currentIndex;
                      const isCurrent = status === currentStatus;

                      return (
                        <div
                          key={status}
                          className={`progress-stage ${
                            completed ? 'completed' : ''
                          } ${isCurrent ? 'current' : ''}`}
                        >
                          <span className="progress-dot">
                            {completed ? '✓' : index + 1}
                          </span>

                          <span className="progress-label">
                            {formatStatus(status)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="order-divider" />

                <div className="order-details">
                  <div>
                    <p className="order-label">CUSTOMER</p>
                    <p>{order.customerName || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="order-label">PHONE</p>
                    <p>{order.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="order-label">TOTAL</p>
                    <p className="order-total">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="order-label">ORDER DATE</p>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="order-items-section">
                  <p className="order-label">ORDER ITEMS</p>

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="order-items-list">
                      {order.items.map((item, index) => {
                        const itemName =
                          item.foodName || item.food?.name || 'Food item';
                        const quantity = Number(item.quantity || 0);
                        const price = Number(
                          item.price ?? item.food?.price ?? 0
                        );

                        return (
                          <div
                            className="order-item-row"
                            key={item.id ?? `${order.id}-${index}`}
                          >
                            <div className="order-item-info">
                              <p className="order-item-name">{itemName}</p>
                              <p className="order-item-quantity">
                                ₹{price.toFixed(2)} × {quantity}
                              </p>
                            </div>

                            <p className="order-item-total">
                              ₹{(price * quantity).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="order-no-items">
                      Item details are unavailable for this order.
                    </p>
                  )}
                </div>

                {order.address && (
                  <div className="order-address">
                    <p className="order-label">DELIVERY ADDRESS</p>
                    <p>{order.address}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
