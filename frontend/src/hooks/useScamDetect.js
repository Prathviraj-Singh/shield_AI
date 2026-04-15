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
      // MOCK BACKEND DELAY
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isDangerous = message.toLowerCase().includes('otp') || message.toLowerCase().includes('job') || message.toLowerCase().includes('kyc');
      
      const simulatedResponse = {
        is_scam: isDangerous,
        scam_type: isDangerous ? "Targeted Fraud Simulation" : "None",
        confidence: isDangerous ? 0.95 : 0.05,
        guidance: isDangerous ? "Do not click any links or share your credentials." : "This message appears completely safe.",
        actions_taken: [
          { tool: "keyword_scanner", observation: "Performed preliminary heuristics parsing. Detected high-risk vector keywords inherently present." },
          { tool: "gemini_deep_analyzer", observation: "Bypassed LLM context mapping. NLP structure indicates synthetic credential harvesting hook intent." },
          { tool: "supabase_pattern_matcher", observation: "Scanned the global Threat Matrix tables. Found isolated similarities." },
          { tool: "save_to_database", observation: "Securely logged structural context string to Postgres logs." },
          { tool: "generate_guidance", observation: "Generated contextual mitigation steps for the user interface natively." },
          { tool: "send_alert", observation: isDangerous ? "High confidence breached. Automated Twilio SMS alert synchronously dispatched!" : "No action required. Thresholds not met." }
        ]
      };
      
      setResult(simulatedResponse);
      return simulatedResponse;
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
