# Transaction Management Feature - Implementation Tasks

## Phase 1: Database & Schema Setup

- [ ] 1. Update database schema
  - [ ] 1.1 Add `userId` column to transactions table
  - [ ] 1.2 Add database indexes for performance
  - [ ] 1.3 Run database migration
  - _Requirements: 1, 2, 3, 4, 5_

## Phase 2: Dependencies Installation

- [ ] 2. Install required packages
  - [ ] 2.1 Install React Query (@tanstack/react-query)
  - [ ] 2.2 Install Zustand
  - [ ] 2.3 Add shadcn toast component
  - [ ] 2.4 Add shadcn select component
  - [ ] 2.5 Add shadcn checkbox component
  - [ ] 2.6 Add shadcn badge component
  - _Requirements: All_

## Phase 3: Validation & Utilities

- [ ] 3. Create validation schemas and utilities
  - [ ] 3.1 Create transaction Zod schema with type and priority enums
  - [ ] 3.2 Create transaction sorting utility function
  - [ ] 3.3 Create React Query configuration and query keys
  - _Requirements: 1, 2, 6_

## Phase 4: State Management

- [ ] 4. Setup client-side state management
  - [ ] 4.1 Create Zustand transaction store for edit mode
  - [ ] 4.2 Add React Query provider to app layout
  - _Requirements: 3_

## Phase 5: Server Actions

- [ ] 5. Implement server actions for data mutations
  - [ ] 5.1 Create `getTransactionsAction` with user filtering and sorting
  - [ ] 5.2 Create `createTransactionAction` with auth and validation
  - [ ] 5.3 Create `updateTransactionAction` with ownership check
  - [ ] 5.4 Create `deleteTransactionAction` with ownership check
  - [ ] 5.5 Create `updateTransactionPaidAction` for toggle functionality
  - _Requirements: 1, 2, 3, 4, 5_

## Phase 6: Core Components

- [ ] 6. Build transaction management components
  - [ ] 6.1 Create TransactionForm component with react-hook-form
  - [ ] 6.2 Integrate form with Zustand store for edit mode
  - [ ] 6.3 Implement form submission handlers (create/update)
  - [ ] 6.4 Add form validation error display
  - [ ] 6.5 Add cancel button and clear form logic
  - [ ] 6.6 Add visual indicator for edit mode (title, button text, styling)
  - _Requirements: 1, 3, 6_

- [ ] 7. Build transaction list components
  - [ ] 7.1 Create TransactionList component with React Query
  - [ ] 7.2 Implement loading state with skeleton/spinner
  - [ ] 7.3 Implement empty state message
  - [ ] 7.4 Apply transaction sorting logic
  - [ ] 7.5 Create TransactionCard component with all transaction details
  - [ ] 7.6 Add edit button with click handler
  - [ ] 7.7 Add delete button with confirmation
  - [ ] 7.8 Add paid toggle checkbox
  - [ ] 7.9 Display priority badge with appropriate styling
  - [ ] 7.10 Display transaction type indicator (income/expense)
  - _Requirements: 2, 3, 4, 5_

## Phase 7: Page Integration

- [ ] 8. Create transactions page
  - [ ] 8.1 Create `/app/transactions` page component
  - [ ] 8.2 Implement responsive layout (desktop: 35/65, tablet: 40/60, mobile: stack)
  - [ ] 8.3 Add proper spacing and padding
  - _Requirements: 1, 2, 8_

## Phase 8: Toast Notifications

- [ ] 9. Implement user feedback
  - [ ] 9.1 Setup shadcn Toaster component in layout
  - [ ] 9.2 Add success toast for create transaction
  - [ ] 9.3 Add success toast for update transaction
  - [ ] 9.4 Add success toast for delete transaction
  - [ ] 9.5 Add error toasts for failed operations
  - _Requirements: 1, 3, 4_

## Phase 9: Optimistic Updates

- [ ] 10. Add optimistic UI updates
  - [ ] 10.1 Implement optimistic update for paid toggle
  - [ ] 10.2 Configure React Query cache invalidation on mutations
  - _Requirements: 5_

## Phase 10: Theme Support

- [ ] 11. Ensure theme compatibility
  - [ ] 11.1 Verify all components use theme-aware Tailwind classes
  - [ ] 11.2 Test edit mode indicator visibility in both themes
  - [ ] 11.3 Verify color contrast meets WCAG AA in both themes
  - _Requirements: 7_

## Phase 11: Responsive Design

- [ ] 12. Implement responsive behavior
  - [ ] 12.1 Test layout on desktop (≥1024px)
  - [ ] 12.2 Test layout on tablet (768px-1023px)
  - [ ] 12.3 Test layout on mobile (<768px)
  - [ ] 12.4 Verify touch target sizes on mobile (min 44x44px)
  - [ ] 12.5 Test form inputs on mobile devices
  - _Requirements: 8_

## Phase 12: Accessibility

- [ ]* 13. Implement accessibility features
  - [ ]* 13.1 Add ARIA labels to icon-only buttons
  - [ ]* 13.2 Associate error messages with form fields via aria-describedby
  - [ ]* 13.3 Add aria-live regions for operation announcements
  - [ ]* 13.4 Test keyboard navigation and tab order
  - [ ]* 13.5 Add visible focus indicators to all interactive elements
  - [ ]* 13.6 Verify semantic HTML usage (form, button, label elements)
  - [ ]* 13.7 Add screen reader announcement for form mode changes
  - [ ]* 13.8 Test with screen reader (VoiceOver/NVDA)
  - _Requirements: 9_

## Phase 13: Testing

- [ ]* 14. Unit tests
  - [ ]* 14.1 Test transaction Zod schema validation
  - [ ]* 14.2 Test sortTransactions utility function
  - [ ]* 14.3 Test Zustand store actions
  - _Requirements: All_

- [ ]* 15. Integration tests
  - [ ]* 15.1 Test TransactionForm submission flow
  - [ ]* 15.2 Test TransactionList rendering and sorting
  - [ ]* 15.3 Test server actions with mocked database
  - _Requirements: All_

- [ ]* 16. E2E tests
  - [ ]* 16.1 Test complete create transaction flow
  - [ ]* 16.2 Test complete edit transaction flow
  - [ ]* 16.3 Test complete delete transaction flow
  - [ ]* 16.4 Test paid toggle flow
  - _Requirements: All_

## Phase 14: Performance Optimization

- [ ]* 17. Optimize performance
  - [ ]* 17.1 Add React.memo to TransactionCard if needed
  - [ ]* 17.2 Verify database indexes are being used
  - [ ]* 17.3 Test with large number of transactions (>100)
  - [ ]* 17.4 Add pagination if needed
  - _Requirements: 2_

## Phase 15: Final Review

- [ ] 18. Code review and polish
  - [ ] 18.1 Run linting (npm run lint)
  - [ ] 18.2 Run formatting (npm run format)
  - [ ] 18.3 Review all acceptance criteria from spec
  - [ ] 18.4 Verify all requirements are met
  - [ ] 18.5 Test complete user flow end-to-end
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional but recommended
- Each task should be completed before moving to the next within the same phase
- Phases can be worked on sequentially or in parallel where dependencies allow
- All database changes should be tested in development before pushing to production
- Keep commits small and focused on individual tasks
