# Design Document: NexoPOS Migration Stabilization

## Overview

This design document outlines a systematic approach to debugging and stabilizing the Urasi POS system. The system is a migration from NexoPOS (PHP-based) to a modern stack using React 18, TypeScript, Vite, TailwindCSS, and Supabase.

The debugging strategy focuses on **static analysis and automated verification** without requiring manual UI testing in a browser. This approach ensures:

1. **Type Safety**: All TypeScript types are correct and consistent with the database schema
2. **Module Resolution**: All imports resolve correctly with no missing dependencies
3. **API Completeness**: All CRUD operations are properly implemented
4. **Error Handling**: Comprehensive error handling prevents runtime crashes
5. **Security**: Data access is properly controlled and validated

The stabilization process will be executed in phases, starting with foundational issues (build system, types, imports) and progressing to higher-level concerns (business logic, performance, security).

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  - Pages (Dashboard, POS, Products, Orders, etc.)       │
│  - Components (UI primitives, Layout, Forms)             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  State Management Layer                  │
│  - React Context (AuthContext)                           │
│  - Custom Hooks (useProducts, useOrders, etc.)          │
│  - Local State (useState, useReducer)                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   API Integration Layer                  │
│  - Supabase Client                                       │
│  - Database Queries (CRUD operations)                    │
│  - Real-time Subscriptions                              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend (Supabase)                      │
│  - PostgreSQL Database                                   │
│  - Authentication (Supabase Auth)                        │
│  - Row Level Security (RLS)                              │
│  - Storage (File uploads)                                │
└─────────────────────────────────────────────────────────┘
```

### Debugging Strategy

The debugging process follows a **bottom-up approach**:

1. **Foundation Layer** (Build & Types)
   - Verify TypeScript compilation
   - Fix type errors
   - Ensure database types match schema

2. **Module Layer** (Imports & Dependencies)
   - Resolve all import paths
   - Verify all dependencies exist
   - Check for circular dependencies

3. **Integration Layer** (Hooks & API)
   - Validate hook implementations
   - Verify CRUD operations
   - Check error handling

4. **Application Layer** (Components & Logic)
   - Validate component props
   - Verify business logic
   - Check form validation

5. **Quality Layer** (Security & Performance)
   - Audit security vulnerabilities
   - Optimize performance
   - Ensure code quality

## Components and Interfaces

### 1. Build Verification System

**Purpose**: Verify TypeScript compilation and build process

**Interface**:
```typescript
interface BuildVerifier {
  compileTypeScript(): CompilationResult
  runBuild(): BuildResult
  getDiagnostics(files: string[]): Diagnostic[]
  validateTypes(): TypeValidationResult
}

interface CompilationResult {
  success: boolean
  errors: CompilationError[]
  warnings: CompilationWarning[]
}

interface BuildResult {
  success: boolean
  outputPath: string
  errors: BuildError[]
  duration: number
}

interface Diagnostic {
  file: string
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
}
```

**Implementation Strategy**:
- Use `tsc --noEmit` for type checking without emitting files
- Use `vite build` for production build verification
- Use VS Code's `getDiagnostics` API for real-time error detection
- Parse compiler output to extract structured error information

### 2. Import Analyzer

**Purpose**: Analyze and validate all module imports

**Interface**:
```typescript
interface ImportAnalyzer {
  scanImports(directory: string): ImportMap
  validateImports(imports: ImportMap): ValidationResult
  findMissingModules(): MissingModule[]
  findUnusedImports(): UnusedImport[]
  suggestFixes(errors: ImportError[]): ImportFix[]
}

interface ImportMap {
  [filePath: string]: Import[]
}

interface Import {
  source: string
  specifiers: string[]
  isTypeOnly: boolean
  resolvedPath: string | null
}

interface ValidationResult {
  valid: boolean
  errors: ImportError[]
  warnings: ImportWarning[]
}

interface ImportError {
  file: string
  line: number
  importPath: string
  reason: 'not-found' | 'circular' | 'type-mismatch'
  suggestion?: string
}
```

**Implementation Strategy**:
- Use `grepSearch` to find all import statements
- Parse import paths and resolve them against file system
- Check for circular dependencies using dependency graph
- Suggest corrections for broken imports based on file names

### 3. Database Type Validator

**Purpose**: Ensure database operations use correct types

**Interface**:
```typescript
interface DatabaseTypeValidator {
  validateSchema(): SchemaValidationResult
  checkQueryTypes(queries: DatabaseQuery[]): TypeCheckResult
  compareWithSupabaseSchema(): SchemaDiff
  generateMissingTypes(): TypeDefinition[]
}

interface SchemaValidationResult {
  valid: boolean
  missingTables: string[]
  missingColumns: ColumnMismatch[]
  typeMismatches: TypeMismatch[]
}

interface DatabaseQuery {
  file: string
  line: number
  table: string
  operation: 'select' | 'insert' | 'update' | 'delete'
  columns: string[]
}

interface TypeCheckResult {
  valid: boolean
  errors: QueryTypeError[]
}

interface QueryTypeError {
  file: string
  line: number
  table: string
  column: string
  expectedType: string
  actualType: string
}
```

**Implementation Strategy**:
- Parse `src/types/database.ts` to extract type definitions
- Use `grepSearch` to find all Supabase queries
- Extract table and column names from queries
- Compare against type definitions
- Report mismatches with specific file locations

### 4. Hook Validator

**Purpose**: Validate custom hook implementations

**Interface**:
```typescript
interface HookValidator {
  validateHook(hookPath: string): HookValidationResult
  checkReturnType(hook: Hook): ReturnTypeCheck
  validateCRUDOperations(hook: Hook): CRUDValidation
  checkErrorHandling(hook: Hook): ErrorHandlingCheck
  checkLoadingStates(hook: Hook): LoadingStateCheck
}

interface HookValidationResult {
  valid: boolean
  hookName: string
  issues: HookIssue[]
}

interface HookIssue {
  type: 'missing-operation' | 'missing-error-handling' | 'missing-loading-state' | 'type-error'
  severity: 'error' | 'warning'
  message: string
  line?: number
}

interface CRUDValidation {
  hasCreate: boolean
  hasRead: boolean
  hasUpdate: boolean
  hasDelete: boolean
  missingOperations: string[]
}
```

**Implementation Strategy**:
- Read hook files from `src/hooks/`
- Parse hook code to identify exported functions
- Check for standard patterns (loading, error, data states)
- Verify CRUD operations are implemented
- Check that all async operations have try-catch blocks

### 5. Component Props Validator

**Purpose**: Validate component props and usage

**Interface**:
```typescript
interface ComponentValidator {
  validateComponent(componentPath: string): ComponentValidationResult
  checkPropsUsage(component: Component): PropsValidation
  findMissingProps(usages: ComponentUsage[]): MissingProps[]
  validatePropTypes(component: Component): PropTypeValidation
}

interface ComponentValidationResult {
  valid: boolean
  componentName: string
  issues: ComponentIssue[]
}

interface PropsValidation {
  requiredProps: string[]
  optionalProps: string[]
  missingProps: string[]
  invalidProps: PropError[]
}

interface PropError {
  propName: string
  expectedType: string
  actualType: string
  usage: string
}
```

**Implementation Strategy**:
- Parse component files to extract prop interfaces
- Find all component usages with `grepSearch`
- Check that required props are provided
- Verify prop types match interface definitions
- Use TypeScript compiler API for type checking

### 6. API Integration Checker

**Purpose**: Verify API integrations are complete

**Interface**:
```typescript
interface APIIntegrationChecker {
  checkPageIntegrations(): PageIntegration[]
  validateCRUDCompleteness(entity: string): CRUDCompleteness
  findMissingOperations(): MissingOperation[]
  checkErrorHandling(operations: APIOperation[]): ErrorHandlingReport
}

interface PageIntegration {
  pageName: string
  requiredOperations: string[]
  implementedOperations: string[]
  missingOperations: string[]
}

interface CRUDCompleteness {
  entity: string
  create: OperationStatus
  read: OperationStatus
  update: OperationStatus
  delete: OperationStatus
}

interface OperationStatus {
  implemented: boolean
  hasErrorHandling: boolean
  hasLoadingState: boolean
  location?: string
}
```

**Implementation Strategy**:
- Map pages to required database operations
- Check hooks for CRUD operation implementations
- Verify error handling exists for each operation
- Report missing operations with suggestions

### 7. Business Logic Validator

**Purpose**: Validate business logic calculations

**Interface**:
```typescript
interface BusinessLogicValidator {
  validateOrderCalculations(): CalculationValidation
  checkDiscountLogic(): DiscountValidation
  checkTaxCalculations(): TaxValidation
  validateStockUpdates(): StockValidation
}

interface CalculationValidation {
  valid: boolean
  issues: CalculationIssue[]
}

interface CalculationIssue {
  type: 'missing-field' | 'incorrect-formula' | 'type-error'
  location: string
  message: string
  suggestion?: string
}
```

**Implementation Strategy**:
- Identify calculation functions in utils and hooks
- Verify formulas match business requirements
- Check that all necessary fields are included
- Validate calculation order (subtotal → discount → tax → total)

## Data Models

### Core Entities

The system manages the following core entities:

1. **Products**
   - Basic product information (name, SKU, barcode, price)
   - Stock management (quantity, low stock alerts)
   - Categories and units
   - Tax configuration

2. **Orders**
   - Order header (code, customer, totals, status)
   - Order items (products, quantities, prices)
   - Payments (payment types, amounts)
   - Calculations (subtotal, discount, tax, total)

3. **Customers**
   - Customer information (name, email, phone)
   - Account balance and credit limit
   - Purchase history
   - Reward points

4. **Registers**
   - Cash register information
   - Opening/closing balance
   - Cash in/out transactions
   - Register status

5. **Users/Profiles**
   - User authentication
   - Roles and permissions
   - Sales statistics

### Database Schema Validation

The database schema is defined in `src/types/database.ts` with the following structure:

```typescript
export interface Database {
  public: {
    Tables: {
      [tableName: string]: {
        Row: { /* column types */ }
        Insert: { /* insert types */ }
        Update: { /* update types */ }
      }
    }
  }
}
```

**Validation Requirements**:
- All tables used in queries must exist in type definitions
- All columns accessed must exist in table definitions
- Insert operations must provide all required fields
- Update operations must use correct field types
- Foreign key relationships must be properly typed

### Type Safety Patterns

**Pattern 1: Typed Queries**
```typescript
// Good: Fully typed query
const { data, error } = await supabase
  .from('products')
  .select('*')
  .returns<Database['public']['Tables']['products']['Row'][]>()

// Bad: Untyped query
const { data, error } = await supabase
  .from('products')
  .select('*')
```

**Pattern 2: Typed Inserts**
```typescript
// Good: Typed insert
const newProduct: Database['public']['Tables']['products']['Insert'] = {
  name: 'Product Name',
  selling_price: 10000,
  // ... all required fields
}

// Bad: Untyped insert
const newProduct = {
  name: 'Product Name',
  // missing required fields
}
```

**Pattern 3: Type Guards**
```typescript
// Good: Type guard for validation
function isValidProduct(data: unknown): data is Product {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'selling_price' in data
  )
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:

**Redundant Properties Eliminated:**
- 2.2 and 2.5 are specific cases of 2.1 (import resolution) - consolidated into Property 1
- 5.1, 5.2, 5.4, 5.5 are all TypeScript compiler checks - consolidated into Property 8
- 12.4 is a TypeScript compiler check - consolidated into Property 8
- 13.2 and 13.3 are npm/yarn checks - consolidated into Property 19

**Properties Combined:**
- 3.4 and 3.5 (table and column validation) combined into Property 4
- 4.4 and 4.5 (loading and error states) combined into Property 6
- 10.4 and 10.5 (async error handling) combined into Property 13
- 14.2 and 14.3 (unused code) combined into Property 21

This reflection ensures each property provides unique validation value without overlap.

### Build and Type Safety Properties

**Property 1: TypeScript Compilation Success**
*For any* valid TypeScript codebase, running the TypeScript compiler should complete without errors and produce no error diagnostics.
**Validates: Requirements 1.1, 1.3**

**Property 2: Build Process Success**
*For any* valid codebase state, running the build process should successfully generate production artifacts in the dist/ directory.
**Validates: Requirements 1.2**

**Property 3: Database Type Consistency**
*For any* table defined in the database schema, the corresponding TypeScript type definition should include all columns with matching types.
**Validates: Requirements 1.4, 1.5**

### Import and Module Properties

**Property 4: Import Resolution**
*For any* import statement in the codebase, the imported module path should resolve to an existing file or installed package.
**Validates: Requirements 2.1, 2.2, 2.5**

**Property 5: Export Verification**
*For any* named import, the imported name should be exported from the target module.
**Validates: Requirements 2.3**

**Property 6: Import Error Reporting**
*For any* broken import, the system should identify the error and suggest a correction based on similar file names.
**Validates: Requirements 2.4**

### Database Query Properties

**Property 7: Query Type Safety**
*For any* database query, the types used for table rows, inserts, and updates should match the Database_Schema type definitions.
**Validates: Requirements 3.1**

**Property 8: Insert Field Completeness**
*For any* insert operation, all required fields (non-nullable without defaults) from the table schema should be provided.
**Validates: Requirements 3.2**

**Property 9: Update Type Correctness**
*For any* update operation, all field values should match the types defined in the table schema.
**Validates: Requirements 3.3**

**Property 10: Schema Name Validation**
*For any* database query, the table name and all column names should exist in the Database_Schema.
**Validates: Requirements 3.4, 3.5**

### Hook Implementation Properties

**Property 11: Hook Return Type Consistency**
*For any* custom hook, the return type should match the expected interface pattern (data, loading, error, operations).
**Validates: Requirements 4.1**

**Property 12: Supabase Method Usage**
*For any* hook performing database operations, Supabase client methods should be called with correct table names and type parameters.
**Validates: Requirements 4.2**

**Property 13: React Hook Usage**
*For any* custom hook, useState and useEffect should be used according to React rules (not called conditionally, proper dependency arrays).
**Validates: Requirements 4.3**

**Property 14: State Management in Hooks**
*For any* hook performing async operations, both loading and error states should be managed and returned.
**Validates: Requirements 4.4, 4.5**

**Property 15: CRUD Completeness**
*For any* hook managing an entity, if it implements any CRUD operation, it should implement all applicable CRUD operations (create, read, update, delete).
**Validates: Requirements 4.6**

### Component Properties

**Property 16: Component Type Safety**
*For any* component usage, TypeScript compilation should verify that all required props are provided and prop types match the component interface.
**Validates: Requirements 5.1, 5.2, 5.4, 5.5**

### API Integration Properties

**Property 17: Page Data Loading**
*For any* page that displays data, the corresponding Supabase query should exist in the associated hook.
**Validates: Requirements 6.1**

**Property 18: Form Submission Implementation**
*For any* form component, the submission handler should call the appropriate insert or update operation.
**Validates: Requirements 6.2**

**Property 19: Delete Operation Implementation**
*For any* delete button or action, the corresponding delete operation should be implemented in the associated hook.
**Validates: Requirements 6.3**

**Property 20: CRUD Error Handling**
*For any* CRUD operation, the operation should be wrapped in error handling (try-catch or .catch()).
**Validates: Requirements 6.4**

### Authentication Properties

**Property 21: Protected Route Guards**
*For any* protected route, the route should be wrapped with an authentication guard component that checks user session.
**Validates: Requirements 7.4**

### Form Validation Properties

**Property 22: Form Schema Definition**
*For any* form using React Hook Form, a validation schema (Zod or similar) should be defined and passed to the form.
**Validates: Requirements 8.1**

**Property 23: Schema-Database Consistency**
*For any* Zod schema validating database input, the schema fields and types should match the database table's Insert type.
**Validates: Requirements 8.2, 8.4, 8.5**

### State Management Properties

**Property 24: Fetch-State Synchronization**
*For any* data fetching operation, the fetched data should be stored in a state variable using setState.
**Validates: Requirements 9.1**

**Property 25: Update Synchronization**
*For any* data update operation, both the local state and database should be updated (optimistic or after confirmation).
**Validates: Requirements 9.2**

**Property 26: State Sharing Mechanism**
*For any* state shared between multiple components, the state should be managed through Context, props, or a state management library.
**Validates: Requirements 9.3**

**Property 27: State Immutability**
*For any* state update, the state should not be mutated directly (no array.push, object.property = value on state).
**Validates: Requirements 9.5**

### Error Handling Properties

**Property 28: Database Error Handling**
*For any* database operation, errors should be caught and either logged or stored in an error state.
**Validates: Requirements 10.1**

**Property 29: Error Boundary Existence**
*For any* application, at least one error boundary component should exist to catch unexpected errors.
**Validates: Requirements 10.3**

**Property 30: Async Error Handling**
*For any* async function or promise, errors should be handled with try-catch or .catch().
**Validates: Requirements 10.4, 10.5**

### Routing Properties

**Property 31: Route Component Existence**
*For any* route definition, the component referenced should exist and be importable.
**Validates: Requirements 12.1**

**Property 32: Navigation Target Validity**
*For any* navigation call (navigate, Link), the target route should be defined in the routing configuration.
**Validates: Requirements 12.2**

**Property 33: Route Protection**
*For any* route requiring authentication, the route should be wrapped with ProtectedRoute or similar guard.
**Validates: Requirements 12.3**

**Property 34: Nested Route Configuration**
*For any* nested route, the parent route should be properly configured with an Outlet or children prop.
**Validates: Requirements 12.5**

### Dependency Properties

**Property 35: Dependency Installation**
*For any* dependency listed in package.json, the corresponding package should exist in node_modules.
**Validates: Requirements 13.1**

**Property 36: Import-Dependency Consistency**
*For any* package imported in source code, the package should be listed in dependencies or devDependencies.
**Validates: Requirements 13.4**

**Property 37: Production Dependency Separation**
*For any* import in src/ directory, the imported package should not be listed only in devDependencies.
**Validates: Requirements 13.5**

### Code Quality Properties

**Property 38: Linting Compliance**
*For any* file in the codebase, running ESLint should produce no errors (warnings acceptable).
**Validates: Requirements 14.1**

**Property 39: No Unused Code**
*For any* variable, import, or function, it should be used at least once in the codebase.
**Validates: Requirements 14.2, 14.3**

**Property 40: Naming Convention Consistency**
*For any* identifier (variable, function, component), it should follow the project's naming conventions (camelCase for variables, PascalCase for components).
**Validates: Requirements 14.4**

**Property 41: No Debug Code**
*For any* file in src/ directory, no console.log, console.debug, or debugger statements should exist.
**Validates: Requirements 14.5**

### Performance Properties

**Property 42: Memoization of Expensive Computations**
*For any* expensive computation (loops, calculations) inside a component, the computation should use useMemo.
**Validates: Requirements 15.2**

**Property 43: Callback Memoization**
*For any* callback function passed as a prop to a child component, the callback should use useCallback.
**Validates: Requirements 15.3**

**Property 44: List Optimization**
*For any* list rendering more than 100 items, the list should use virtualization (react-window, react-virtualized) or pagination.
**Validates: Requirements 15.4**

**Property 45: Image Lazy Loading**
*For any* image element, the loading attribute should be set to "lazy" unless the image is above the fold.
**Validates: Requirements 15.5**

### Security Properties

**Property 46: RLS Policy Verification**
*For any* database table containing user data, Row Level Security policies should be enabled in Supabase.
**Validates: Requirements 16.1**

**Property 47: Permission Checks**
*For any* sensitive operation (delete, update critical data), the operation should include a permission check before execution.
**Validates: Requirements 16.2, 16.10**

**Property 48: No Exposed Secrets**
*For any* file in the codebase, no hardcoded passwords, API keys, or tokens should exist (except in .env files).
**Validates: Requirements 16.3, 16.4**

**Property 49: SQL Injection Prevention**
*For any* database query, the query should use Supabase client methods (not raw SQL strings) to prevent SQL injection.
**Validates: Requirements 16.6**

**Property 50: Input Validation**
*For any* user input field, the input should be validated (type, format, length) before being used in operations.
**Validates: Requirements 16.7**

## Error Handling

### Error Categories

1. **Compilation Errors**
   - TypeScript type errors
   - Missing imports
   - Syntax errors
   - **Handling**: Report all errors with file locations, stop execution until fixed

2. **Build Errors**
   - Vite build failures
   - Asset loading errors
   - Configuration errors
   - **Handling**: Report errors, suggest fixes, stop build process

3. **Runtime Errors** (detected through static analysis)
   - Potential null/undefined access
   - Missing error handlers
   - Unhandled promise rejections
   - **Handling**: Report warnings, suggest adding error handling

4. **Logic Errors**
   - Incorrect calculations
   - Missing business logic
   - Incomplete CRUD operations
   - **Handling**: Report as warnings, suggest implementation

5. **Security Errors**
   - Exposed secrets
   - Missing permission checks
   - SQL injection risks
   - **Handling**: Report as critical errors, require immediate fix

### Error Reporting Format

All errors should be reported in a structured format:

```typescript
interface ErrorReport {
  severity: 'error' | 'warning' | 'info'
  category: 'compilation' | 'build' | 'runtime' | 'logic' | 'security'
  file: string
  line?: number
  column?: number
  message: string
  suggestion?: string
  property?: string // Which correctness property failed
}
```

### Error Recovery Strategies

1. **Auto-fixable Errors**
   - Unused imports → Remove automatically
   - Missing imports → Add automatically if source is known
   - Formatting issues → Fix with prettier/eslint --fix

2. **Suggestible Errors**
   - Broken imports → Suggest similar file names
   - Missing types → Suggest adding type annotations
   - Missing error handling → Suggest try-catch pattern

3. **Manual Fix Required**
   - Logic errors → Explain issue, provide examples
   - Security issues → Explain risk, provide secure alternative
   - Complex type errors → Explain type mismatch, suggest fix

## Testing Strategy

### Dual Testing Approach

This project uses both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs
- Both are complementary and necessary for complete validation

### Static Analysis Testing

Since we're debugging without running the UI, testing focuses on **static analysis**:

1. **TypeScript Compiler Testing**
   - Run `tsc --noEmit` to check for type errors
   - Parse compiler output for structured error reporting
   - Verify zero errors for successful compilation

2. **Build Process Testing**
   - Run `vite build` to verify production build
   - Check for successful artifact generation
   - Verify build completes without errors

3. **Code Pattern Testing**
   - Use `grepSearch` to find code patterns
   - Analyze patterns for correctness
   - Report violations of best practices

4. **Import Analysis Testing**
   - Extract all import statements
   - Verify each import resolves to existing file
   - Check for circular dependencies

5. **Database Query Testing**
   - Extract all Supabase queries
   - Verify table and column names exist in schema
   - Check types match schema definitions

### Testing Tools

1. **TypeScript Compiler** (`tsc`)
   - Type checking
   - Compilation verification
   - Error reporting

2. **Vite Build** (`vite build`)
   - Production build verification
   - Asset bundling
   - Build error detection

3. **getDiagnostics API**
   - Real-time error detection
   - File-specific diagnostics
   - IDE-level error reporting

4. **grepSearch Tool**
   - Pattern matching in code
   - Finding specific constructs
   - Code analysis

5. **File System Tools**
   - Reading source files
   - Analyzing file structure
   - Verifying file existence

### Property Test Configuration

Each correctness property will be verified through automated checks:

- **Minimum Iterations**: Each check runs on all applicable files/patterns
- **Test Tags**: Each test references its design property
- **Tag Format**: `// Feature: nexopos-migration-stabilization, Property N: [property text]`

### Test Execution Order

Tests should be executed in dependency order:

1. **Phase 1: Foundation** (Properties 1-3)
   - TypeScript compilation
   - Build process
   - Database types

2. **Phase 2: Modules** (Properties 4-6)
   - Import resolution
   - Export verification
   - Module structure

3. **Phase 3: Database** (Properties 7-10)
   - Query type safety
   - Schema validation
   - CRUD operations

4. **Phase 4: Hooks** (Properties 11-15)
   - Hook implementations
   - State management
   - CRUD completeness

5. **Phase 5: Components** (Properties 16-20)
   - Component types
   - API integrations
   - Form handling

6. **Phase 6: Application** (Properties 21-34)
   - Authentication
   - Routing
   - Navigation

7. **Phase 7: Quality** (Properties 35-45)
   - Dependencies
   - Code quality
   - Performance

8. **Phase 8: Security** (Properties 46-50)
   - Access control
   - Input validation
   - Secret management

### Success Criteria

The system is considered "100% working" when:

1. ✅ All TypeScript compilation succeeds (0 errors)
2. ✅ Build process completes successfully
3. ✅ All imports resolve correctly
4. ✅ All database queries use correct types
5. ✅ All hooks implement required operations
6. ✅ All components have correct props
7. ✅ All routes are properly configured
8. ✅ All forms have validation
9. ✅ All CRUD operations have error handling
10. ✅ No security vulnerabilities detected
11. ✅ All 50 correctness properties pass verification

### Continuous Verification

After initial stabilization, implement continuous verification:

1. **Pre-commit Hooks**
   - Run TypeScript compiler
   - Run linter
   - Check for common issues

2. **CI/CD Pipeline**
   - Full build verification
   - All property checks
   - Security scanning

3. **Development Workflow**
   - Real-time diagnostics in IDE
   - Immediate error feedback
   - Automated fix suggestions
