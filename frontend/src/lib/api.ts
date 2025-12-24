const API_URL = "http://localhost:8000/api";

export interface Question {
  id: string;
  text: string;
  attribute: string;
  operator: string;
  value: any;
  ui_type: "binary" | "slider" | "keyword";
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  duration_seconds: number;
  views_total: number;
}

export interface SessionResponse {
  session_id: string;
  total_candidates: number;
  question: Question;
}

export interface AnswerResponse {
  status: "active" | "reveal";
  remaining_candidates?: number;
  question?: Question;
  track?: Track;
}

export const api = {
  start: async (query: string): Promise<SessionResponse> => {
    const res = await fetch(`${API_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Failed to start session");
    return res.json();
  },

  answer: async (sessionId: string, questionId: string, answer: boolean): Promise<AnswerResponse> => {
    const res = await fetch(`${API_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer }),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
  },
};