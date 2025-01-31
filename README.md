# Decentralized Food Traceability System

A blockchain-based solution for tracking food products from farm to table. This system provides:

- Registration of food items with unique identifiers
- Tracking of ownership transfers
- Status updates throughout the supply chain
- Complete history of each food item with detailed notes
- Verification of authenticity and origin

## New Feature: Product Certification System

The system now includes a comprehensive certification management system that allows:

- Registration of authorized certification authorities
- Addition of product certifications (e.g., Organic, Non-GMO, Fair Trade)
- Verification of certification authenticity through authorized authorities
- Multiple certifications per product (up to 10)
- Full certification history tracking

## Enhanced Tracking History

The system now includes detailed notes for all tracking events:
- Optional notes field for registration, transfers, and status updates
- Improved traceability with contextual information
- Better audit trail with detailed documentation
- Support for compliance and quality control processes

Built on Stacks blockchain using Clarity smart contracts.

## Key Functions

- `add-certification-authority`: Register new certification authorities
- `add-certification`: Add certifications to existing food items
- `get-certification-authority`: Verify certification authority status
- `update-status`: Update item status with optional notes
- `transfer-ownership`: Transfer ownership with transaction notes

All certifications and tracking events are managed by authorized entities and permanently recorded on the blockchain with detailed notes for improved traceability.
