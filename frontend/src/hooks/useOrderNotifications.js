import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useOrderNotifications = (settings, onNewOrder) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    // Initialize notification sound
    if (settings?.notification_sound_url) {
      notificationSoundRef.current = new Audio(settings.notification_sound_url);
    } else {
      // Default notification sound
      notificationSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    }

    // Connect to WebSocket
    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [settings]);

  const connectWebSocket = () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const wsUrl = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/ws/admin';
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected - Real-time order notifications ACTIVE');
        wsRef.current = ws;
        
        // Send ping every 30 seconds
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
        
        ws.pingInterval = pingInterval;
      };
      
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_order') {
            console.log('🔔 NEW ORDER RECEIVED VIA WEBSOCKET!', data.order);
            
            // Play sound IMMEDIATELY
            if (notificationSoundRef.current) {
              try {
                // Update sound source if changed
                if (settings?.notification_sound_url) {
                  notificationSoundRef.current.src = settings.notification_sound_url;
                }
                await notificationSoundRef.current.play();
                console.log('✅ Notification sound played');
              } catch (err) {
                console.error('❌ Sound failed:', err);
                // Fallback: try to play again after user interaction
                document.addEventListener('click', () => {
                  notificationSoundRef.current?.play().catch(() => {});
                }, { once: true });
              }
            }
            
            // Browser notification
            if ('Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('🔔 YENİ SİPARİŞ!', {
                  body: `Sipariş #${data.order.order_number}\n${data.order.first_name} ${data.order.last_name}\nTutar: €${data.order.total_price?.toFixed(2)}`,
                  icon: '/logo192.png',
                  tag: 'new-order-' + data.order.id,
                  requireInteraction: true,
                  vibrate: [200, 100, 200]
                });
              } else if (Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }
            
            // Toast notification
            toast.success(`🔔 YENİ SİPARİŞ! #${data.order.order_number} - €${data.order.total_price?.toFixed(2)}`, {
              duration: 10000,
              position: 'top-right'
            });
            
            // Callback to refresh orders
            if (onNewOrder) {
              onNewOrder(data.order);
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket closed - reconnecting in 5s...');
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        
        // Auto-reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reconnecting...');
          connectWebSocket();
        }, 5000);
      };
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      // Retry after 10 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000);
    }
  };

  return notificationSoundRef;
};
