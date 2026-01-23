# API Service Architecture Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
│        (admin pages, student dashboards, etc.)              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────────────────────┐
             │      Service Layer              │
             │   (lib/api/services/*)          │
             │                                 │
             ├─ authService                    │
             ├─ adminService                   │
             ├─ kelasService                   │
             ├─ elearningService               │
             ├─ studentService                 │
             ├─ guruService                    │
             └─ settingsService                │
             │
             ▼
    ┌────────────────────┐
    │  axiosInstance     │
    │  (centralized)     │
    │                    │
    │ • Base URL config  │
    │ • Token injection  │
    │ • Error handling   │
    │ • Interceptors     │
    └────────┬───────────┘
             │
             ▼
      ┌─────────────┐
      │  NestJS     │
      │   Backend   │
      │    API      │
      └─────────────┘
```

## Service Structure

### Each Service Contains:

1. **Interfaces**: Type definitions for data models
2. **Methods**: API endpoint wrappers with full CRUD support
3. **Error Handling**: Automatic via axios interceptor
4. **Singleton Export**: Single instance for entire app

### Service Pattern

```typescript
// Template for all services
class MyService {
	// GET - fetch
	async getAll(params?): Promise<{ data: T[] }> {}

	// GET - single
	async getById(id: number): Promise<{ data: T }> {}

	// POST - create
	async create(data: CreateRequest): Promise<{ data: T }> {}

	// PUT - update
	async update(id: number, data: UpdateRequest): Promise<{ data: T }> {}

	// DELETE - remove
	async delete(id: number): Promise<{ message: string }> {}
}

export default new MyService();
```

## API Response Pattern

All endpoints follow consistent response structure:

```typescript
// Success Response
{
  data: T | T[],
  pagination?: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}

// Error Response (handled by interceptor)
{
  message: string,
  statusCode: number,
  data?: any
}
```

## Axios Interceptors

### Request Interceptor

```typescript
- Adds Authorization header with Bearer token
- Token retrieved from localStorage
- Applied to ALL requests automatically
```

### Response Interceptor

```typescript
- 401 Unauthorized → Redirect to /auth/login
- 403 Forbidden → Log and display error
- Other errors → Pass to catch block
```

## Component Usage Pattern

### Before (without services)

```typescript
import axios from "axios";

export default function MyComponent() {
	const [data, setData] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setData(response.data.data);
		};
		fetchData();
	}, []);
}
```

### After (with services)

```typescript
import { myService } from "@/lib/api/services";

export default function MyComponent() {
	const [data, setData] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const response = await myService.getAll();
			setData(response.data);
		};
		fetchData();
	}, []);
}
```

## Service Catalog

### 1. authService

**Purpose**: Authentication operations
**Methods**: login, register, logout, token management
**Usage**: Auth flows, login/register pages

```typescript
const response = await authService.login({ username, password });
localStorage.setItem("token", response.access_token);
```

### 2. adminService

**Purpose**: Admin operations for users and system
**Methods**: User CRUD, teacher dropdown, statistics
**Usage**: Admin dashboard, user management

```typescript
const users = await adminService.getAllUsers({ page: 1, limit: 10 });
await adminService.createUser(userData);
```

### 3. kelasService

**Purpose**: Class/kelas management
**Methods**: Kelas CRUD, guru assignment, student management
**Usage**: Class list, class details page

```typescript
const kelas = await kelasService.getKelasById(id);
await kelasService.assignGuruToKelas(kelasId, guruId);
```

### 4. elearningService

**Purpose**: Subject/mata pelajaran management
**Methods**: Fetch, create, update, delete subjects
**Usage**: E-learning page, dropdowns

```typescript
const subjects = await elearningService.getAllMataPelajaran();
await elearningService.createMataPelajaran({ nama: "Matematika" });
```

### 5. studentService

**Purpose**: Student lifecycle management
**Methods**: Student CRUD, availability, import
**Usage**: Student page, class details

```typescript
const students = await studentService.getAllStudents(page, limit);
await studentService.importStudents(file, kelasOption);
```

### 6. guruService

**Purpose**: Teacher/guru management
**Methods**: Teacher CRUD, subject mapping
**Usage**: Teacher page, teacher details

```typescript
const teachers = await guruService.getAllGuru(page, limit);
await guruService.updateGuruKelasMapel(guruId, mapelIds);
```

### 7. settingsService

**Purpose**: System settings management
**Methods**: Tingkat (level) CRUD, Angkatan (year) CRUD, general settings
**Usage**: Settings pages

```typescript
const tingkatList = await settingsService.getTingkatList();
await settingsService.createTingkat(tingkatData);
```

## API Endpoints Reference

### Auth Endpoints

```
POST   /auth/login                     → authService.login()
POST   /auth/register                  → authService.register()
```

### Admin Endpoints

```
GET    /admin/users                    → adminService.getAllUsers()
POST   /admin/users                    → adminService.createUser()
PUT    /admin/users/{id}               → adminService.updateUser()
POST   /admin/users/{id}/delete        → adminService.deleteUser()
PUT    /admin/users/{id}/status        → adminService.updateUserStatus()
GET    /admin/teachers                 → adminService.getTeachersDropdown()
GET    /admin/stats                    → adminService.getSystemStatistics()
```

### Class Endpoints

```
GET    /admin/kelas                    → kelasService.getAllKelas()
GET    /admin/kelas/{id}               → kelasService.getKelasById()
POST   /admin/kelas                    → kelasService.createKelas()
PUT    /admin/kelas/{id}               → kelasService.updateKelas()
DELETE /admin/kelas/{id}               → kelasService.deleteKelas()
GET    /admin/kelas/dropdown/all       → kelasService.getKelasDropdown()
POST   /admin/kelas/{id}/guru-mapel    → kelasService.assignGuruToKelas()
DELETE /admin/kelas/{id}/guru-mapel    → kelasService.removeGuruFromKelas()
```

### Subject Endpoints

```
GET    /elearning/mata-pelajaran       → elearningService.getAllMataPelajaran()
POST   /elearning/mata-pelajaran       → elearningService.createMataPelajaran()
PUT    /elearning/mata-pelajaran/{id}  → elearningService.updateMataPelajaran()
DELETE /elearning/mata-pelajaran/{id}  → elearningService.deleteMataPelajaran()
```

### Student Endpoints

```
GET    /admin/students                 → studentService.getAllStudents()
POST   /admin/students                 → studentService.createStudent()
PUT    /admin/students/{id}            → studentService.updateStudent()
POST   /admin/students/{id}/delete     → studentService.deleteStudent()
POST   /admin/students/import          → studentService.importStudents()
```

### Teacher Endpoints

```
GET    /admin/guru                     → guruService.getAllGuru()
POST   /admin/guru                     → guruService.createGuru()
PUT    /admin/guru/{id}                → guruService.updateGuru()
POST   /admin/guru/{id}/delete         → guruService.deleteGuru()
```

### Settings Endpoints

```
GET    /settings/tingkat               → settingsService.getTingkatList()
POST   /settings/tingkat               → settingsService.createTingkat()
PUT    /settings/tingkat/{id}          → settingsService.updateTingkat()
DELETE /settings/tingkat/{id}          → settingsService.deleteTingkat()
GET    /settings/angkatan              → settingsService.getAngkatanList()
POST   /settings/angkatan              → settingsService.createAngkatan()
PUT    /settings/angkatan/{id}         → settingsService.updateAngkatan()
DELETE /settings/angkatan/{id}         → settingsService.deleteAngkatan()
```

## Error Handling

### Global Error Handling (axiosInstance)

```typescript
// 401 - Unauthorized
if (error.response.status === 401) {
	// Redirect to login automatically
	router.push("/auth/login");
}

// 403 - Forbidden
if (error.response.status === 403) {
	// Log the forbidden action
	console.log("Access denied");
}
```

### Component-Level Error Handling

```typescript
try {
	await service.operation();
} catch (error) {
	// Error already logged by interceptor if 401/403
	// Display user-friendly message
	alert("Operation failed");
}
```

## Adding New Services

### Step 1: Create service file

```typescript
// lib/api/services/newService.ts
import axiosInstance from "@/lib/api/axiosInstance";

class NewService {
	async getAll(): Promise<{ data: any[] }> {
		return axiosInstance.get("/endpoint");
	}
}

export default new NewService();
```

### Step 2: Export in index.ts

```typescript
// lib/api/services/index.ts
export { default as newService } from "./newService";
```

### Step 3: Use in components

```typescript
import { newService } from "@/lib/api/services";

const response = await newService.getAll();
```

## Best Practices

1. **Always use services** - Never use axios directly in components
2. **Type everything** - Use interfaces for all API responses
3. **Handle errors** - Use try/catch in components
4. **Use async/await** - Not .then() chains
5. **Validate input** - Check data before sending to service
6. **Follow naming** - Service methods match REST verbs (getAll, getById, create, update, delete)

## Migration Checklist

When refactoring existing code:

- [ ] Remove axios import
- [ ] Import needed services
- [ ] Replace axios calls with service methods
- [ ] Remove Authorization headers (service handles it)
- [ ] Remove hardcoded URLs
- [ ] Update error handling if needed
- [ ] Test all API operations
- [ ] Verify token handling works

## Future Enhancements

1. **Request Caching**: Cache GET requests for better performance
2. **Retry Logic**: Automatic retry on network failures
3. **Request Throttling**: Prevent duplicate requests
4. **Progress Tracking**: Upload/download progress for files
5. **Mock Service**: For testing without backend
6. **Analytics**: Track API performance metrics
7. **Rate Limiting**: Client-side rate limit handling
