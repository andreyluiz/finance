- [x] Phase 1: Wire payment session launcher
  - Add "Start Payment Session" button to transactions page and open dialog container _Requirements: 1.1-1.3_
  - Provide initial dialog shell with dismiss/reset handling _Requirements: 1.2-1.3_

- [x] Phase 2: Build session selection flow
  - Surface unpaid expenses grouped by current and past billing periods with clear headers and toggling _Requirements: 2.1-2.3_
  - Calculate selected totals and income, display warning banner, allow acknowledgement _Requirements: 2.4, 3.1-3.3_
  - Prevent advancing when no expenses selected across all periods, persist ordered queue on continue _Requirements: 2.4-2.5_

- [x] Phase 3: Implement session runner interactions
  - Show focused transaction detail with progress indicators _Requirements: 4.1, 4.5_
  - Handle mark-as-paid action with optimistic update backed by server action _Requirements: 4.2, 5.2, 5.4_
  - Handle skip action recording unmodified transactions _Requirements: 4.3-4.4_

- [x] Phase 4: Deliver completion summary and synchronization
  - Present summary of paid vs skipped totals and items _Requirements: 5.1_
  - Invalidate transactions query and close dialog while maintaining state resets _Requirements: 5.2-5.3_
  - Surface toast/error messaging for failed updates with rollback _Requirements: 5.4_

- [x]* Phase 5: Expand automated coverage
  - Unit test reducers/utilities for selection totals and runner transitions _Requirements: 3.*, 4.*, 5._
  - Component/integration tests for session workflow happy path and warning display _Requirements: 2.*, 3.*, 5._
