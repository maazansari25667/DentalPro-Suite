# Wavenet Care Dental Hospital Management System

A comprehensive dental hospital management system built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. This system provides complete patient management, appointment scheduling, and administrative capabilities for dental practices.

## 🚀 Features

### 👤 User Management
- **Dr. Benjamin Carter** - Chief Dental Officer
- Secure authentication with role-based access
- Professional dental hospital interface

### 📋 Patient Management
- Complete patient records with medical history
- Advanced search and filtering capabilities
- **Comprehensive pagination** with customizable page sizes
- CRUD operations for patient data
- Insurance information tracking
- Emergency contact management

### 📅 Appointment Management
- Real-time appointment tracking
- **Paginated appointment lists** with status filtering
- Multiple appointment statuses (Scheduled, Completed, Cancelled, No-show)
- Doctor assignment and scheduling

### 📊 Dashboard & Analytics
- Hospital metrics and statistics
- **Paginated recent appointments** display
- Activity monitoring
- Quick access to all system modules

## 🔧 Pagination Features

This system includes comprehensive pagination throughout all data displays:

### ✅ Patient Management Pagination
- **Location**: `/patients` page
- **Features**:
  - Customizable page sizes (5, 10, 20, 50 per page)
  - Smart navigation with ellipsis for large datasets
  - Search integration (pagination resets on search)
  - Real-time item count display
  - Responsive pagination controls

### ✅ Appointment Lists Pagination
- **Location**: Dashboard and appointment views
- **Features**:
  - Configurable page sizes (5, 10, 15 per page)
  - Status-based filtering with pagination
  - Compact pagination for dashboard widgets
  - Date-sorted appointment display

### ✅ Data Tables Pagination
- **Location**: All table components (`BasicTableOne`, etc.)
- **Features**:
  - Enhanced table with pagination controls
  - Extended sample data for demonstration
  - Sortable columns with pagination preservation
  - Page size selection dropdown

### 🛠️ Pagination Components

#### 1. **Enhanced Pagination Component**
```tsx
// Advanced pagination with full controls
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={goToPage}
  onItemsPerPageChange={setItemsPerPage}
  showItemsPerPageSelect={true}
  showItemCount={true}
  pageSizeOptions={[5, 10, 20, 50]}
/>
```

#### 2. **Custom usePagination Hook**
```tsx
// Reusable pagination logic
const {
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  paginatedData,
  goToPage,
  setItemsPerPage,
} = usePagination({
  data: filteredData,
  initialItemsPerPage: 10,
});
```

## 📱 Technical Stack

- **Framework**: Next.js 15.2.3 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Authentication**: Custom authentication system
- **Responsive Design**: Mobile-first approach

## 🏥 System Credentials

### Login Details
- **Email**: `benjamin@wavenetcare.com`
- **Password**: `dental2024`
- **User**: Dr. Benjamin Carter (Chief Dental Officer)

## 🎯 Pagination Implementation Details

### Patient List Pagination
- **10 sample patients** with complete dental records
- **Default page size**: 10 patients per page
- **Search functionality** with automatic pagination reset
- **Responsive table** with mobile-optimized layout

### Appointment Pagination
- **12 sample appointments** with various statuses
- **Default page size**: 5 appointments per page
- **Status color coding**: Scheduled (Blue), Completed (Green), Cancelled (Red), No-show (Yellow)
- **Doctor assignment**: All appointments assigned to Dr. Benjamin Carter

### Table Component Pagination
- **Enhanced BasicTableOne** with 12+ records
- **Project management data** for demonstration
- **Team member avatars** and status badges
- **Budget tracking** with formatted display

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd wavenet-care-admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**
- Open [http://localhost:3003](http://localhost:3003)
- Login with the provided credentials

## 📖 Usage Guide

### Patient Management
1. Navigate to **Patients** → **All Patients**
2. Use the search bar to filter patients
3. Adjust page size using the dropdown (5-50 patients)
4. Navigate through pages using pagination controls
5. Click **Add New Patient** to create records

### Appointment Tracking
1. View recent appointments on the **Dashboard**
2. Use pagination to browse through appointment history
3. Filter by status or date range
4. Access patient details from appointment records

### Data Tables
1. All data tables include pagination automatically
2. Customize page sizes based on your preference
3. Use search and filter functions
4. Export capabilities (coming soon)

## 🎨 UI/UX Features

- **Dark/Light Mode** support
- **Responsive design** for all screen sizes
- **Professional medical interface** with blue color scheme
- **Accessible navigation** with breadcrumbs
- **Loading states** and error handling
- **Toast notifications** for user actions

## 🔮 Future Enhancements

- [ ] Advanced appointment scheduling
- [ ] Doctor management system
- [ ] Treatment plans and procedures
- [ ] Billing and insurance integration
- [ ] Reporting and analytics
- [ ] Export functionality for all data
- [ ] Advanced search with filters
- [ ] Audit logs and activity tracking

## 📄 License

This project is proprietary software developed for Wavenet Care Dental Hospital.

---

**Wavenet Care** - Professional Dental Hospital Management
*Powered by Next.js and modern web technologies*