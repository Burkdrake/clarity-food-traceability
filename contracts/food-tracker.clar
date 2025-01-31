;; Define data structures
(define-map food-items 
    { food-id: uint }
    {
        producer: principal,
        product-name: (string-ascii 50),
        production-date: uint,
        location: (string-ascii 100),
        status: (string-ascii 20),
        current-holder: principal
    }
)

(define-map tracking-history
    { food-id: uint, timestamp: uint }
    {
        holder: principal,
        location: (string-ascii 100),
        status: (string-ascii 20)
    }
)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-item-not-found (err u101))

;; Data variables
(define-data-var last-food-id uint u0)

;; Register new food item
(define-public (register-food-item 
    (product-name (string-ascii 50))
    (location (string-ascii 100)))
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
                current-holder: tx-sender
            }
        )
        (var-set last-food-id new-id)
        (map-set tracking-history
            { food-id: new-id, timestamp: block-height }
            {
                holder: tx-sender,
                location: location,
                status: "produced"
            }
        )
        (ok new-id)
    )
)

;; Update food item status
(define-public (update-status 
    (food-id uint)
    (new-status (string-ascii 20))
    (location (string-ascii 100)))
    (let ((item (unwrap! (get-food-item food-id) err-item-not-found)))
        (if (is-eq (get current-holder item) tx-sender)
            (begin
                (map-set food-items
                    { food-id: food-id }
                    (merge item { 
                        status: new-status,
                        location: location
                    })
                )
                (map-set tracking-history
                    { food-id: food-id, timestamp: block-height }
                    {
                        holder: tx-sender,
                        location: location,
                        status: new-status
                    }
                )
                (ok true)
            )
            err-not-authorized
        )
    )
)

;; Transfer ownership
(define-public (transfer-ownership
    (food-id uint)
    (new-holder principal)
    (location (string-ascii 100)))
    (let ((item (unwrap! (get-food-item food-id) err-item-not-found)))
        (if (is-eq (get current-holder item) tx-sender)
            (begin
                (map-set food-items
                    { food-id: food-id }
                    (merge item { 
                        current-holder: new-holder,
                        location: location
                    })
                )
                (map-set tracking-history
                    { food-id: food-id, timestamp: block-height }
                    {
                        holder: new-holder,
                        location: location,
                        status: (get status item)
                    }
                )
                (ok true)
            )
            err-not-authorized
        )
    )
)

;; Read only functions
(define-read-only (get-food-item (food-id uint))
    (ok (map-get? food-items { food-id: food-id }))
)

(define-read-only (get-item-history (food-id uint))
    (ok (map-get? tracking-history { food-id: food-id }))
)
