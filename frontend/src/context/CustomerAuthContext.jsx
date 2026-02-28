import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer is logged in (from localStorage)
    const savedCustomer = localStorage.getItem('customer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Failed to parse saved customer:', error);
        localStorage.removeItem('customer');
      }
    }
    setLoading(false);
  }, []);

  const login = async (firstName, lastName) => {
    try {
      const response = await fetch(`${API_URL}/api/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const customerData = await response.json();
      setCustomer(customerData);
      localStorage.setItem('customer', JSON.stringify(customerData));
      toast.success(`Welcome back, ${customerData.first_name}!`);
      return customerData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstName, lastName, phone) => {
    try {
      const response = await fetch(`${API_URL}/api/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const customerData = await response.json();
      setCustomer(customerData);
      localStorage.setItem('customer', JSON.stringify(customerData));
      toast.success(`Welcome, ${customerData.first_name}!`);
      return customerData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer');
    toast.success('Logged out successfully');
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
