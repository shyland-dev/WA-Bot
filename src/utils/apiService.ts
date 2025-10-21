import axios from 'axios';
import { debugLog } from './debug';
import { config } from './config';

interface LoginResponse {
  message: string;
  token: string;
  expires: number;
}

interface TestRecord {
  id: string;
  phrase: string;
  number: string;
  date: string;
}

interface TestResponse {
  message: string;
  count: number;
  data: TestRecord[];
}

interface SingleTestResponse {
  message: string;
  data: TestRecord;
}

interface CreateUpdateRequest {
  phrase: string;
  number: number;
  date: string;
}

interface ApiResponse {
  message: string;
}

class ApiService {
  private axiosInstance: ReturnType<typeof axios.create>;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.webservice.url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async login(): Promise<string> {
    const loginData = {
      user: config.webservice.user,
      password: config.webservice.password,
    };

    debugLog('Attempting to login to webservice...');

    const response = await this.axiosInstance.post<LoginResponse>('/api/login', loginData);
    
    if (!response.data.token) {
      throw new Error('Login failed: No token received');
    }

    this.token = response.data.token;
    this.tokenExpiry = new Date(Date.now() + (response.data.expires * 1000));

    debugLog('Login successful, token expires at:', this.tokenExpiry.toISOString());
    
    return this.token;
  }

  private isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           this.tokenExpiry > new Date();
  }

  private async getValidToken(): Promise<string> {
    if (!this.isTokenValid()) {
      debugLog('Token expired or not available, logging in...');
      await this.login();
    }
    
    return this.token!;
  }

  async getAllTestData(): Promise<TestResponse> {
    const token = await this.getValidToken();
    
    debugLog('Fetching all test data from webservice...');

    const response = await this.axiosInstance.get<TestResponse>('/api/test', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    debugLog('All test data retrieved successfully, count:', response.data.count);
    
    return response.data;
  }

  async getTestDataById(id: string): Promise<SingleTestResponse> {
    const token = await this.getValidToken();
    
    debugLog('Fetching test data by ID:', id);

    const response = await this.axiosInstance.get<SingleTestResponse>(`/api/test/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    debugLog('Test data retrieved successfully for ID:', id);
    
    return response.data;
  }

  async createTestData(data: CreateUpdateRequest): Promise<ApiResponse> {
    const token = await this.getValidToken();
    
    debugLog('Creating new test data:', data);

    const response = await this.axiosInstance.post<ApiResponse>('/api/test', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    debugLog('Test data created successfully');
    
    return response.data;
  }

  async updateTestData(id: string, data: CreateUpdateRequest): Promise<ApiResponse> {
    const token = await this.getValidToken();
    
    debugLog('Updating test data for ID:', id, 'with data:', data);

    const response = await this.axiosInstance.put<ApiResponse>(`/api/test/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    debugLog('Test data updated successfully for ID:', id);
    
    return response.data;
  }

  async deleteTestData(id: string): Promise<ApiResponse> {
    const token = await this.getValidToken();
    
    debugLog('Deleting test data for ID:', id);

    const response = await this.axiosInstance.delete<ApiResponse>(`/api/test/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    debugLog('Test data deleted successfully for ID:', id);
    
    return response.data;
  }
}

export const apiService = new ApiService();