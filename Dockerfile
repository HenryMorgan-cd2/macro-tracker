# Build stage for Vite app
FROM node:22-alpine AS vite-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies with network timeout and retry
RUN npm i 

# Copy source code
COPY . .

# Build the Vite app
RUN npm run build

# Final stage with Go app
FROM golang:1.21-alpine AS go-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy Go source code
COPY main.go ./

# Build the Go binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -a -installsuffix cgo \
    -ldflags="-w -s" \
    -o main .

# Final runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the Go binary from builder stage
COPY --from=go-builder /app/main .

# Copy the built Vite app from vite-builder stage
COPY --from=vite-builder /app/dist ./dist

# Run the application
CMD ["./main"]
