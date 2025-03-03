;; Define data structures
(define-map food-items 
    { food-id: uint }
    {
        producer: principal,
        product-name: (string-ascii 50),
        production-date: uint,
        location: (string-ascii 100),
        status: (string-ascii 20),
        current-holder: principal,
        certifications: (list 10 (string-ascii 30))
    }
)

(define-map tracking-history-entries
    { food-id: uint }
    {
        entries: (list 50 {
            timestamp: uint,
            holder: principal,
            location: (string-ascii 100),
            status: (string-ascii 20),
            notes: (optional (string-ascii 200))
        })
    }
)

(define-map certification-authorities
    { authority: principal }
    {
        name: (string-ascii 50),
        active: bool
    }
)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-item-not-found (err u101))
(define-constant err-not-certification-authority (err u102))
(define-constant err-invalid-input (err u103))
(define-constant err-list-full (err u104))

;; Data variables
(define-data-var last-food-id uint u0)

;; Helper functions
(define-private (is-valid-string (input (string-ascii 200)))
    (and 
        (not (is-eq input ""))
        (<= (len input) u200)
    )
)

(define-private (is-valid-certification-authority (authority principal))
    (match (map-get? certification-authorities { authority: authority })
        authority-data (get active authority-data)
        false
    )
)

(define-private (add-history-entry
    (food-id uint)
    (holder principal)
    (location (string-ascii 100))
    (status (string-ascii 20))
    (notes (optional (string-ascii 200))))
    (let ((current-history (default-to 
        { entries: (list) }
        (map-get? tracking-history-entries { food-id: food-id }))))
        (match (as-max-len? 
            (append 
                (get entries current-history)
                {
                    timestamp: block-height,
                    holder: holder,
                    location: location,
                    status: status,
                    notes: notes
                }
            )
            u50)
            success (begin
                (map-set tracking-history-entries
                    { food-id: food-id }
                    { entries: success }
                )
                (ok true)
            )
            (err err-list-full)
        )
    )
)

;; Event definitions
(define-public (emit-food-item-registered (food-id uint) (producer principal))
    (ok true)
)

(define-public (emit-history-entry-added (food-id uint) (holder principal))
    (ok true)
)

;; Register new food item
(define-public (register-food-item 
    (product-name (string-ascii 50))
    (location (string-ascii 100))
    (initial-certifications (list 10 (string-ascii 30)))
    (notes (optional (string-ascii 200))))
    (if (and 
        (is-valid-string product-name)
        (is-valid-string location)
        (<= (len initial-certifications) u10))
        (let
            ((new-id (+ (var-get last-food-id) u1)))
            (map-set food-items
                { food-id: new-id }
                {
                    producer: tx-sender,
                    product-name: product-name,
                    production-date: block-height,
                    location: location,
                    status: "produced",
                    current-holder: tx-sender,
                    certifications: initial-certifications
                }
            )
            (var-set last-food-id new-id)
            (unwrap! (add-history-entry new-id tx-sender location "produced" notes)
                err-list-full)
            (emit-food-item-registered new-id tx-sender)
            (ok new-id)
        )
        err-invalid-input
    )
)
