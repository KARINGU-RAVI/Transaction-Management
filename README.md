Transaction Management API
This project is a Transaction Management API built using Django and Django REST Framework (DRF). The API is designed to manage financial transactions, supporting operations like creating transactions, viewing transaction history, and updating transaction status.

Features:
Transaction Model: Manages financial transactions with fields like amount, transaction_type (DEPOSIT/WITHDRAWAL), user, timestamp, and status (PENDING/COMPLETED/FAILED).
API Endpoints:
Create Transaction: POST /api/transactions/
View Transactions: GET /api/transactions/ (filter by user_id)
Update Transaction Status: PUT /api/transactions/{transaction_id}/
Get Transaction Details: GET /api/transactions/{transaction_id}/
The system allows users to create transactions, track their status, and update them as needed, providing an easy way to manage financial activities programmatically.
