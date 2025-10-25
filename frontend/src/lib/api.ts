import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add token for registration and login endpoints
    if (!config.url?.includes('/register/') && !config.url?.includes('/auth/token/')) {
      const token = localStorage.getItem('access_token');
      console.log('API Request:', { url: config.url, hasToken: !!token, token: token ? 'exists' : 'null' });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { url: response.config.url, status: response.status });
    return response;
  },
  async (error) => {
    console.log('API Error:', { url: error.config?.url, status: error.response?.status, message: error.message });
    const originalRequest = error.config;

    // Don't try to refresh token for registration and login endpoints
    if (error.response?.status === 401 && !originalRequest._retry && 
        !originalRequest.url?.includes('/register/') && 
        !originalRequest.url?.includes('/auth/token/')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/token/', credentials),
  
  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => api.post('/register/', userData),
  
  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
};

// Board API
export const boardAPI = {
  getBoards: () => api.get('/boards/'),
  getBoard: (id: number) => api.get(`/boards/${id}/`),
  createBoard: (data: { title: string; description?: string; visibility?: string; background_color?: string }) =>
    api.post('/boards/', data),
  updateBoard: (id: number, data: Partial<{ title: string; description: string; visibility: string; background_color: string }>) =>
    api.patch(`/boards/${id}/`, data),
  deleteBoard: (id: number) => api.delete(`/boards/${id}/`),
  getMembers: (id: number) => api.get(`/boards/${id}/members/`),
  addMember: (id: number, data: { username: string; role?: string }) =>
    api.post(`/boards/${id}/members/`, data),
  removeMember: (id: number, memberId: number) =>
    api.delete(`/boards/${id}/members/${memberId}/`),
  getTemplates: () => api.get('/templates/'),
  createFromTemplate: (templateId: number) => api.post(`/templates/${templateId}/create-board/`),
};

// List API
export const listAPI = {
  getLists: (boardId: number) => api.get(`/boards/${boardId}/lists/`),
  createList: (boardId: number, data: { title: string }) =>
    api.post(`/boards/${boardId}/lists/`, data),
  updateList: (boardId: number, id: number, data: Partial<{ title: string; position: number; archived: boolean }>) =>
    api.patch(`/boards/${boardId}/lists/${id}/`, data),
  deleteList: (boardId: number, id: number) =>
    api.delete(`/boards/${boardId}/lists/${id}/`),
  archiveList: (boardId: number, id: number) =>
    api.patch(`/boards/${boardId}/lists/${id}/`, { archived: true }),
  reorderLists: (boardId: number, listOrders: { id: number; position: number }[]) =>
    api.post(`/boards/${boardId}/reorder-lists/`, { list_orders: listOrders }),
};

// Card API
export const cardAPI = {
  getCards: (listId: number) => api.get(`/lists/${listId}/cards/`),
  getCardsByBoard: (boardId: number) => api.get(`/boards/${boardId}/cards/`),
  getCard: (cardId: number) => api.get(`/cards/${cardId}/`),
  createCard: (listId: number, data: { title: string; description?: string; label_ids?: number[] }) =>
    api.post(`/lists/${listId}/cards/`, data),
  updateCard: (id: number, data: Partial<{
    title: string;
    description: string;
    position: number;
    label_ids: number[];
    start_date?: string | null;
    due_date?: string | null;
    cover_color?: string | null;
    cover_image?: File | null;
  }>) => {
    // Check if we have a file upload
    if (data.cover_image) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key as keyof typeof data] !== null && data[key as keyof typeof data] !== undefined) {
          formData.append(key, data[key as keyof typeof data] as any);
        }
      });
      return api.patch(`/cards/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.patch(`/cards/${id}/`, data);
    }
  },
  deleteCard: (listId: number, id: number) =>
    api.delete(`/lists/${listId}/cards/${id}/`),
  moveCard: (data: { card_id: number; list_id: number; position: number }) =>
    api.post('/cards/move/', data),
  archiveCard: (id: number) =>
    api.patch(`/cards/${id}/`, { archived: true }),
  archiveAllCardsInList: (listId: number) =>
    api.post(`/lists/${listId}/archive-all-cards/`),
};

// Label API
export const labelAPI = {
  getLabels: (boardId: number) => api.get(`/boards/${boardId}/labels/`),
  createLabel: (boardId: number, data: { name: string; color: string }) =>
    api.post(`/boards/${boardId}/labels/`, data),
  updateLabel: (boardId: number, id: number, data: Partial<{ name: string; color: string }>) =>
    api.patch(`/boards/${boardId}/labels/${id}/`, data),
  deleteLabel: (boardId: number, id: number) =>
    api.delete(`/boards/${boardId}/labels/${id}/`),
};

// Comment API
export const commentAPI = {
  getComments: (cardId: number) => api.get(`/cards/${cardId}/comments/`),
  createComment: (cardId: number, data: { content: string }) =>
    api.post(`/cards/${cardId}/comments/`, data),
  updateComment: (cardId: number, id: number, data: { content: string }) =>
    api.patch(`/cards/${cardId}/comments/${id}/`, data),
  deleteComment: (cardId: number, id: number) =>
    api.delete(`/cards/${cardId}/comments/${id}/`),
  addReaction: (commentId: number, emoji: string) =>
    api.post(`/comments/${commentId}/reactions/`, { emoji }),
  removeReaction: (commentId: number, emoji: string) =>
    api.delete(`/comments/${commentId}/reactions/`, { data: { emoji } }),
};

// Attachment API
export const attachmentAPI = {
  getAttachments: (cardId: number) => api.get(`/cards/${cardId}/attachments/`),
  createAttachment: (cardId: number, formData: FormData) =>
    api.post(`/cards/${cardId}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateAttachment: (cardId: number, id: number, data: { name: string }) =>
    api.patch(`/cards/${cardId}/attachments/${id}/`, data),
  deleteAttachment: (cardId: number, id: number) =>
    api.delete(`/cards/${cardId}/attachments/${id}/`),
};

// Checklist API
export const checklistAPI = {
  getChecklists: (cardId: number) => api.get(`/cards/${cardId}/checklists/`),
  createChecklist: (cardId: number, data: { title: string }) =>
    api.post(`/cards/${cardId}/checklists/`, data),
  updateChecklist: (cardId: number, id: number, data: { title: string }) =>
    api.patch(`/cards/${cardId}/checklists/${id}/`, data),
  deleteChecklist: (cardId: number, id: number) =>
    api.delete(`/cards/${cardId}/checklists/${id}/`),
  createItem: (checklistId: number, data: { text: string }) =>
    api.post(`/checklists/${checklistId}/items/`, data),
  updateItem: (checklistId: number, itemId: number, data: { text?: string; completed?: boolean }) =>
    api.patch(`/checklists/${checklistId}/items/${itemId}/`, data),
  deleteItem: (checklistId: number, itemId: number) =>
    api.delete(`/checklists/${checklistId}/items/${itemId}/`),
};

export default api;
