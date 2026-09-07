import type {
  Highlight,
  HighlightResponse,
  HighlightsResponse,
  CreateHighlightInput,
  UpdateHighlightInput,
} from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

const getHighlights = async (): Promise<Highlight[]> => {
  const response = await fetch(`${API_URL}/highlights`);

  const data: HighlightsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch highlights.");
  }

  return data.result;
};

const createHighlight = async (
  highlight: CreateHighlightInput,
): Promise<Highlight> => {
  const response = await fetch(`${API_URL}/highlights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(highlight),
  });

  const data: HighlightResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not create highlight.");
  }

  return data.result;
};

const updateHighlight = async (
  id: number,
  highlight: UpdateHighlightInput,
): Promise<Highlight> => {
  const response = await fetch(`${API_URL}/highlights/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(highlight),
  });

  const data: HighlightResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not update highlight.");
  }

  return data.result;
};

const deleteHighlight = async (id: number): Promise<Highlight> => {
  const response = await fetch(`${API_URL}/highlights/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data: HighlightResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete highlight.");
  }

  return data.result;
};

export { getHighlights, createHighlight, updateHighlight, deleteHighlight };
