export interface RegisterResponse<T> {
  isSuccess: boolean;
  data: T;
  error: string;
  message: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  id: string;
  email: string;
  username: string;
  accessToken: string;
  imageFilePath: string;
}
