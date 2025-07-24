# 📝 Development Conventions & Coding Standards

This document covers coding standards, conventions, and best practices for the Turbo repo project.

## 📋 Table of Contents

- [Overview](#-overview)
- [TypeScript Guidelines](#typescript-guidelines)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Conventions](#testing-conventions)
- [Package Development Standards](#package-development-standards)
- [Security Guidelines](#security-guidelines)

## 🎯 Overview

This project follows modern development conventions with:

- **TypeScript First**: Full type safety across all applications
- **Consistent Code Style**: Biome for formatting and linting
- **Comprehensive Testing**: Jest with Testing Library
- **Conventional Commits**: Standardized commit messages
- **Quality Assurance**: Automated code quality checks

## 📝 TypeScript Guidelines

### Strict TypeScript Usage

1. **Type Safety**:
   ```typescript
   // Use strict type checking
   const user: User = {
     id: 1,
     name: "John Doe",
     email: "john@example.com"
   };
   
   // Avoid any type
   // ❌ Bad
   const data: any = fetchData();
   
   // ✅ Good
   const data: ApiResponse = fetchData();
   ```

2. **Interface Definitions**:
   ```typescript
   // Define clear interfaces
   interface User {
     id: number;
     name: string;
     email: string;
     createdAt: Date;
   }
   
   // Use generics for reusable components
   interface ApiResponse<T> {
     data: T;
     status: number;
     message: string;
   }
   ```

3. **Type Guards**:
   ```typescript
   // Use type guards for runtime type checking
   function isUser(obj: unknown): obj is User {
     return (
       typeof obj === 'object' &&
       obj !== null &&
       'id' in obj &&
       'name' in obj &&
       'email' in obj
     );
   }
   ```

### TypeScript Best Practices

1. **Explicit Return Types**:
   ```typescript
   // ✅ Good - explicit return type
   function getUser(id: number): Promise<User | null> {
     return fetchUser(id);
   }
   
   // ✅ Good - explicit async return type
   async function createUser(data: CreateUserData): Promise<User> {
     const response = await api.post('/users', data);
     return response.data;
   }
   ```

2. **Union Types**:
   ```typescript
   // Use union types for finite options
   type ButtonVariant = 'primary' | 'secondary' | 'danger';
   type ButtonSize = 'small' | 'medium' | 'large';
   
   interface ButtonProps {
     variant: ButtonVariant;
     size: ButtonSize;
     disabled?: boolean;
   }
   ```

3. **Utility Types**:
   ```typescript
   // Use utility types for type transformations
   type PartialUser = Partial<User>;
   type UserWithoutId = Omit<User, 'id'>;
   type UserKeys = keyof User;
   type UserValues = User[UserKeys];
   ```

## 🎨 Code Style Guidelines

### Naming Conventions

1. **Variables and Functions**:
   ```typescript
   // Use camelCase for variables and functions
   const userName = "John";
   const getUserData = () => {};
   const isAuthenticated = true;
   const hasPermission = false;
   ```

2. **Classes and Interfaces**:
   ```typescript
   // Use PascalCase for classes and interfaces
   class UserService {}
   interface UserData {}
   class ApiClient {}
   interface ApiResponse<T> {}
   ```

3. **Constants**:
   ```typescript
   // Use UPPER_SNAKE_CASE for constants
   const API_BASE_URL = "https://api.example.com";
   const MAX_RETRY_ATTEMPTS = 3;
   const DEFAULT_TIMEOUT = 5000;
   ```

4. **File Naming**:
   ```typescript
   // Use kebab-case for file names
   // user-service.ts
   // api-client.ts
   // auth-guard.ts
   // user-card.component.tsx
   ```

### File Organization

1. **Import Ordering**:
   ```typescript
   // 1. React imports
   import React from 'react';
   import { useState, useEffect } from 'react';
   
   // 2. Third-party imports
   import axios from 'axios';
   import { useQuery } from '@tanstack/react-query';
   
   // 3. Local imports (absolute paths first)
   import { User } from '@/types';
   import { useAuth } from '@/hooks';
   
   // 4. Relative imports
   import { Button } from './Button';
   import { styles } from './styles.module.css';
   ```

2. **Export Organization**:
   ```typescript
   // 1. Type exports
   export type { User, UserRole } from './types';
   
   // 2. Component exports
   export { UserCard } from './UserCard';
   export { UserList } from './UserList';
   
   // 3. Hook exports
   export { useUser } from './hooks/useUser';
   export { useAuth } from './hooks/useAuth';
   
   // 4. Utility exports
   export { formatUser } from './utils/formatUser';
   ```

### Component Structure

1. **Functional Components**:
   ```typescript
   // Use functional components with hooks
   interface UserCardProps {
     user: User;
     onEdit: (user: User) => void;
     onDelete: (userId: number) => void;
   }
   
   export const UserCard: React.FC<UserCardProps> = ({ 
     user, 
     onEdit, 
     onDelete 
   }) => {
     const [isLoading, setIsLoading] = useState(false);
   
     const handleEdit = async () => {
       setIsLoading(true);
       try {
         await onEdit(user);
       } finally {
         setIsLoading(false);
       }
     };
   
     return (
       <div className="user-card">
         <h3>{user.name}</h3>
         <p>{user.email}</p>
         <div className="actions">
           <button onClick={handleEdit} disabled={isLoading}>
             {isLoading ? 'Editing...' : 'Edit'}
           </button>
           <button onClick={() => onDelete(user.id)}>
             Delete
           </button>
         </div>
       </div>
     );
   };
   ```

2. **Custom Hooks**:
   ```typescript
   // Use custom hooks for reusable logic
   interface UseUserOptions {
     userId: number;
     enabled?: boolean;
   }
   
   export const useUser = ({ userId, enabled = true }: UseUserOptions) => {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
   
     const fetchUser = async () => {
       setLoading(true);
       setError(null);
       try {
         const data = await api.getUser(userId);
         setUser(data);
       } catch (err) {
         setError(err as Error);
       } finally {
         setLoading(false);
       }
     };
   
     useEffect(() => {
       if (enabled) {
         fetchUser();
       }
     }, [userId, enabled]);
   
     return { user, loading, error, refetch: fetchUser };
   };
   ```

### Error Handling

1. **Try-Catch Patterns**:
   ```typescript
   // Use try-catch for async operations
   const handleSubmit = async (data: FormData) => {
     try {
       setLoading(true);
       const result = await api.submit(data);
       onSuccess(result);
     } catch (error) {
       console.error('Submit failed:', error);
       onError(error as Error);
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Error Boundaries**:
   ```typescript
   // Use error boundaries for React components
   class ErrorBoundary extends React.Component<
     { children: React.ReactNode },
     { hasError: boolean }
   > {
     constructor(props: { children: React.ReactNode }) {
       super(props);
       this.state = { hasError: false };
     }
   
     static getDerivedStateFromError(): { hasError: boolean } {
       return { hasError: true };
     }
   
     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
     }
   
     render() {
       if (this.state.hasError) {
         return <div>Something went wrong.</div>;
       }
   
       return this.props.children;
     }
   }
   ```

## 🧪 Testing Conventions

### Test Structure

1. **Test Organization**:
   ```typescript
   // Use descriptive test names and proper structure
   describe('UserService', () => {
     describe('getUser', () => {
       it('should return user when valid ID is provided', async () => {
         // Arrange
         const userId = 1;
         const expectedUser = { id: 1, name: 'John' };
         
         // Act
         const result = await userService.getUser(userId);
         
         // Assert
         expect(result).toEqual(expectedUser);
       });
       
       it('should throw error when invalid ID is provided', async () => {
         // Arrange
         const invalidId = -1;
         
         // Act & Assert
         await expect(userService.getUser(invalidId)).rejects.toThrow();
       });
     });
   });
   ```

2. **Testing Utilities**:
   ```typescript
   // Create reusable test utilities
   export const createMockUser = (overrides: Partial<User> = {}): User => ({
     id: 1,
     name: 'Test User',
     email: 'test@example.com',
     createdAt: new Date(),
     ...overrides
   });
   
   export const createMockApiResponse = <T>(data: T): ApiResponse<T> => ({
     data,
     status: 200,
     message: 'Success'
   });
   
   export const createMockError = (message: string): Error => new Error(message);
   ```

### Component Testing

1. **React Testing Library**:
   ```typescript
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import { UserCard } from './UserCard';
   
   describe('UserCard', () => {
     it('should display user information', () => {
       const user = createMockUser({ name: 'John Doe' });
       const onEdit = jest.fn();
       
       render(<UserCard user={user} onEdit={onEdit} />);
       
       expect(screen.getByText('John Doe')).toBeInTheDocument();
       expect(screen.getByText(user.email)).toBeInTheDocument();
     });
     
     it('should call onEdit when edit button is clicked', async () => {
       const user = createMockUser();
       const onEdit = jest.fn();
       
       render(<UserCard user={user} onEdit={onEdit} />);
       
       fireEvent.click(screen.getByText('Edit'));
       
       await waitFor(() => {
         expect(onEdit).toHaveBeenCalledWith(user);
       });
     });
   });
   ```

2. **Hook Testing**:
   ```typescript
   import { renderHook, waitFor } from '@testing-library/react';
   import { useUser } from './useUser';
   
   describe('useUser', () => {
     it('should fetch user data', async () => {
       const mockUser = createMockUser();
       jest.spyOn(api, 'getUser').mockResolvedValue(mockUser);
       
       const { result } = renderHook(() => useUser({ userId: 1 }));
       
       expect(result.current.loading).toBe(true);
       
       await waitFor(() => {
         expect(result.current.user).toEqual(mockUser);
         expect(result.current.loading).toBe(false);
       });
     });
   });
   ```

## 📦 Package Development Standards

### Package Structure

```typescript
// packages/ui/src/index.ts
export { Button } from './components/Button';
export { Card } from './components/Card';
export type { ButtonProps } from './components/Button';

// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    }
  }
}
```

### Shared Package Guidelines

1. **API Design**:
   ```typescript
   // Design clear, stable APIs
   export interface ButtonProps {
     variant?: 'primary' | 'secondary' | 'danger';
     size?: 'small' | 'medium' | 'large';
     disabled?: boolean;
     onClick?: () => void;
     children: React.ReactNode;
   }
   
   // Provide sensible defaults
   export const Button: React.FC<ButtonProps> = ({
     variant = 'primary',
     size = 'medium',
     disabled = false,
     onClick,
     children
   }) => {
     // Implementation
   };
   ```

2. **Type Exports**:
   ```typescript
   // Export types for consumers
   export type { ButtonProps } from './Button';
   export type { CardProps } from './Card';
   export type { Theme } from './theme';
   ```

3. **Documentation**:
   ```typescript
   /**
    * Button component for user interactions
    * 
    * @example
    * ```tsx
    * <Button variant="primary" onClick={handleClick}>
    *   Click me
    * </Button>
    * ```
    */
   export const Button: React.FC<ButtonProps> = ({ ... }) => {
     // Implementation
   };
   ```

## 🔒 Security Guidelines

### Code Security

1. **Input Validation**:
   ```typescript
   // Always validate user input
   const validateEmail = (email: string): boolean => {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   };
   
   const validatePassword = (password: string): boolean => {
     // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
     return passwordRegex.test(password);
   };
   
   const handleSubmit = (data: FormData) => {
     if (!validateEmail(data.email)) {
       throw new Error('Invalid email format');
     }
     if (!validatePassword(data.password)) {
       throw new Error('Password does not meet requirements');
     }
     // Process data
   };
   ```

2. **Environment Variables**:
   ```typescript
   // Use environment variables for sensitive data
   const API_KEY = process.env.API_KEY;
   const DATABASE_URL = process.env.DATABASE_URL;
   
   // Validate required environment variables
   if (!API_KEY) {
     throw new Error('API_KEY is required');
   }
   
   if (!DATABASE_URL) {
     throw new Error('DATABASE_URL is required');
   }
   ```

3. **Sanitization**:
   ```typescript
   // Sanitize user input to prevent XSS
   const sanitizeHtml = (html: string): string => {
     return html
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;');
   };
   
   const displayUserContent = (content: string) => {
     const sanitized = sanitizeHtml(content);
     return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
   };
   ```

### API Security

1. **Authentication**:
   ```typescript
   // Use JWT tokens for authentication
   const authenticate = async (token: string) => {
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       return decoded;
     } catch (error) {
       throw new Error('Invalid token');
     }
   };
   
   // Implement token refresh
   const refreshToken = async (refreshToken: string) => {
     try {
       const response = await api.post('/auth/refresh', { refreshToken });
       return response.data.accessToken;
     } catch (error) {
       throw new Error('Token refresh failed');
     }
   };
   ```

2. **Rate Limiting**:
   ```typescript
   // Implement rate limiting
   const rateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', rateLimiter);
   ```

3. **CORS Configuration**:
   ```typescript
   // Configure CORS properly
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Testing Library](https://testing-library.com/)
- [Biome Documentation](https://biomejs.dev/)

---

**For more information about development workflow, see [Development Guide](./3_DEVFLOW.md).** 