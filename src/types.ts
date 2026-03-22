export type SessionMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type Template = {
  id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  preferences: object;
  createdAt: string;
  templates: Template[];
};

export type GenerateResponse = {
  type: 'report' | 'question';
  content: string;
  templateDetected?: string;
};
