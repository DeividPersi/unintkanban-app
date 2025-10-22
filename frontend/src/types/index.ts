export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Board {
  id: number;
  title: string;
  description: string;
  owner: User;
  members: BoardMember[];
  lists: List[];
  labels: Label[];
  created_at: string;
  updated_at: string;
}

export interface BoardMember {
  id: number;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface List {
  id: number;
  title: string;
  board: number;
  position: number;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  list: number;
  position: number;
  labels: Label[];
  comments: Comment[];
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  board: number;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}
