# Payment Session Feature Specification

## Introduction

This feature introduces a guided "Payment Session" workflow that helps users batch-pay outstanding expenses. Users can kick off a payment session from the transactions screen, choose which unpaid expenses to handle, receive warnings if selected payments exceed the billing period's income, and step through each transaction with clear actions to mark items as paid or skip them. A completion summary confirms the outcomes and the main transaction list stays in sync with the updates.

## Requirements

### Requirement 1: Launch Payment Session

**User Story:** As a user, I want to start a payment session from the transactions page, so that I can batch-manage paying my outstanding expenses.

#### Acceptance Criteria

1. WHEN a user views the transactions page THEN the system SHALL display a button labeled "Start Payment Session"
2. WHEN the user clicks "Start Payment Session" THEN the system SHALL open a flow for configuring the session without leaving the transactions page
3. WHEN the session flow opens THEN the system SHALL focus the session UI and dim or overlay the underlying transactions content to keep the user in context

### Requirement 2: Select Expenses for Session

**User Story:** As a user, I want to choose which unpaid expenses belong in the session, so that I only process the payments I intend to cover.

#### Acceptance Criteria

1. WHEN the session configuration view loads THEN the system SHALL list unpaid expense transactions starting with the billing period currently selected on the transactions page (defaulting to the actual current period) followed by each past period in descending chronological order
2. WHEN periods are rendered THEN the system SHALL visually separate each section and label it with the month/year, marking the transactions-page selection as "(current)" (e.g., "October 2025 (current)", "September 2025")
3. WHEN the user toggles an expense in any period THEN the system SHALL update the set of selected transactions immediately
4. IF there are no unpaid expenses across the current and past periods THEN the system SHALL show an empty state and prevent advancing the flow
5. WHEN the user confirms the selection THEN the system SHALL capture the ordered list of chosen transactions preserving the period and due-date ordering for the execution step

### Requirement 3: Warn About Income Coverage

**User Story:** As a user, I want to know when selected expenses exceed the billing period's income, so that I can adjust before I start paying.

#### Acceptance Criteria

1. WHEN the user selects expenses for the session THEN the system SHALL display the total selected amount and the current billing period's total income
2. IF the total selected expenses exceed the current billing period income THEN the system SHALL show a prominent warning explaining the shortfall and clarifying that coverage is calculated against the current period
3. WHEN the warning is shown THEN the system SHALL still allow the user to continue after acknowledging the alert

### Requirement 4: Run Payment Session

**User Story:** As a user, I want to step through each selected transaction with clear actions, so that I can efficiently mark bills as paid in sequence.

#### Acceptance Criteria

1. WHEN the user begins the execution step THEN the system SHALL show one transaction at a time with name, amount, due date, and any relevant labels
2. WHEN the user clicks "Mark as paid" THEN the system SHALL mark the transaction as paid and advance to the next one in the session queue
3. WHEN the user clicks "Skip" THEN the system SHALL leave the transaction unpaid, record the skip, and advance to the next one
4. WHEN the user reaches the final transaction THEN the system SHALL update paid status or skip state before presenting the completion summary
5. WHEN the session is in progress THEN the system SHALL provide visibility into remaining transactions (e.g., counter or progress indicator)

### Requirement 5: Complete Session and Sync State

**User Story:** As a user, I want a summary of the session results and for the main transactions list to reflect the changes, so that I can confirm what was paid.

#### Acceptance Criteria

1. WHEN the session finishes THEN the system SHALL display a summary showing paid versus skipped transactions and total amounts
2. WHEN the user closes the summary THEN the system SHALL persist paid-state updates for all marked transactions
3. WHEN the summary closes THEN the system SHALL refresh the transactions data so the list reflects newly paid transactions without a full page reload
4. IF any paid-state update fails THEN the system SHALL report the error and keep the relevant transaction in the unpaid state
