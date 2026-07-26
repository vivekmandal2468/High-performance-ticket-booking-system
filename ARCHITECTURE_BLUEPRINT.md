# High-Scale Node.js Ticket Booking System Architecture Blueprint

## 1. System Overview & Core Requirements
- **High Concurrency**: Ability to handle tens of thousands of concurrent users during flash sales / high-demand ticket drops.
- **Zero Double-Booking**: Guaranteed transactional isolation using Redis atomic operations and Database locks.
- **Seat Reservation Lifecycle**: Dynamic seat locks (e.g., 10-minute temporary holding time) with automatic release upon timeout.
- **Scalability**: Decoupled microservices/modular monolith architecture supported by event queues and horizontal scaling.

---

## 2. Tech Stack & Infrastructure

| Component | Technology Selected | Purpose / Justification |
| :--- | :--- | :--- |
| **Runtime / API** | Node.js (TypeScript) + Fastify or Express | Async I/O capability for high throughput |
| **Cache & Seat Locks** | Redis (Cluster) + Lua Scripts | In-memory atomic seat locking & TTL holding |
| **Message Queue** | Redis Streams / BullMQ | Reliable processing of bookings, notifications, payment timeouts |
| **Primary Database** | PostgreSQL | ACID compliance, JSONB support for flexible metadata |
| **ORMs / Query** | Prisma / Kysely / Slonik | High-performance DB query building |
| **Load Testing** | k6 / Autocannon | Simulating realistic high-concurrency traffic bursts |

---

## 3. Detailed Component & Data Flow

### Seat Lock & Reservation Lifecycle
1. User requests seat reservation (POST /api/v1/shows/:id/reserve).
2. API runs atomic Redis Lua Script to verify and acquire lock (TTL 10 min).
3. If successful, lock token is returned and seat reservation status is set to PENDING_PAYMENT.
4. Delay job added to BullMQ to expire lock if payment callback is not received within 10 minutes.
5. On payment confirmation, Postgres updates seat status to BOOKED within an ACID transaction.

---

## 4. Database Schema Design (PostgreSQL)

`sql
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID REFERENCES shows(id),
    seat_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    version INT DEFAULT 1,
    UNIQUE(show_id, seat_number)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    show_id UUID REFERENCES shows(id),
    seat_ids JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`

---

## 5. Atomic Redis Lua Script (Preventing Double Booking)

`lua
local show_prefix = KEYS[1]
local lock_ttl = 600

for i = 2, #ARGV do
    local seat_key = show_prefix .. ":" .. ARGV[i]
    if redis.call("EXISTS", seat_key) == 1 then
        return {err = "SEAT_ALREADY_LOCKED: " .. ARGV[i]}
    end
end

for i = 2, #ARGV do
    local seat_key = show_prefix .. ":" .. ARGV[i]
    redis.call("SET", seat_key, ARGV[1], "EX", lock_ttl)
end

return "OK"
`

---

## 6. Implementation Roadmap Sessions

### Session 1: Project Setup & Database Layer
- Init Node.js TypeScript workspace in D:\github project
- Docker Compose setup for PostgreSQL and Redis
- DB Migration & ORM models setup

### Session 2: Concurrency & Lock Engine (Redis + Lua)
- Redis client configuration & connection pooling
- Dynamic seat lock / unlock Lua script implementation
- Unit tests for concurrent lock acquiring

### Session 3: Queue & Asynchronous Worker (BullMQ)
- BullMQ queue integration with Redis
- Auto-cancellation worker for expired reservations
- Payment webhook simulation & seat booking confirmation

### Session 4: High-Concurrency Load & Stress Testing
- Write k6 stress test scenarios simulating 10,000 requests on identical seats
- Measure sub-millisecond response latency & deadlock checks
- Performance tuning (DB connection pool, Redis cluster tuning)
