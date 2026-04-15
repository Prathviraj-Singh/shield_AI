import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export function useScamDetect() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const detectMessage = async (message) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${baseUrl}/api/detect`, {
        message: message,
        user_id: currentUser?.id || ""
      });
      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "An error occurred during scanning. Please try again.";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { detectMessage, result, loading, error };
}
